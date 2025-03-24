import { db } from "$lib/server/db";
import * as schema from "$lib/schema";
import { and, eq } from "drizzle-orm";
import { atclient } from "$lib/server/client";
import { isValidHandle } from "@atproto/syntax";
import { renderTextToMarkdownToHTML } from "$lib/utils";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { Agent, RichText } from "@atproto/api";

export const actions: Actions = {
  "login": async ({ cookies, request }) => {
    const formData = await request.formData();
    const handle = formData.get("handle") as string;
    if (!isValidHandle(handle)) { error(400, { message: "invalid handle" }); }
    const stayLoggedIn = (formData.get("stay_logged_in") as string) === "on";
    cookies.set("stayLoggedIn", stayLoggedIn.toString(), { path: "/", maxAge: 60 });

    const url = await atclient.authorize(handle, { scope: "atproto transition:generic" });
    if (!url) {
      error(500);
    }
    redirect(301, url.toString());
  },
  "logout": async ({ cookies }) => {
    cookies.delete("sid", { path: "/" });
    cookies.delete("stayLoggedIn", { path: "/" });
    redirect(301, "/");
  },
  "createPost": async ({ request, locals }) => {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const draftId = formData.get("draft_id") as string;

    if (locals.agent instanceof Agent) {
      const rt = new RichText({
        text: content
      });
      await rt.detectFacets(locals.agent);

      locals.agent.post({
        $type: "app.bsky.feed.post", // lexicon
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      });

      if (draftId) {
        await db.delete(schema.DraftPost).where(eq(schema.DraftPost.id, draftId));
      }
    }
  },
  "createReply": async ({ request, locals }) => {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const parent_cid = formData.get("parent_cid") as string;
    const parent_uri = formData.get("parent_uri") as string;
    const root_cid = formData.get("root_cid") as string;
    const root_uri = formData.get("root_uri") as string;

    if (locals.agent instanceof Agent) {
      const rt = new RichText({
        text: content
      });
      await rt.detectFacets(locals.agent);

      const reply = await locals.agent.post({
        $type: "app.bsky.feed.post", // lexicon
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
        reply: {
          root: {
            cid: root_cid,
            uri: root_uri
          },
          parent: {
            cid: parent_cid,
            uri: parent_uri
          }
        }
      });

      const newReply = await locals.agent.getPostThread({
        uri: reply.uri
      });

      // @ts-ignore
      newReply.data.thread.html = await renderTextToMarkdownToHTML(newReply.data.thread.post.record.text, locals.agent);

      return { newReply: JSON.stringify(newReply.data.thread) };
    }
  },
  "deletePost": async ({ request, locals }) => {
    const formData = await request.formData();
    const post_uri = formData.get("post_uri") as string | undefined;

    try {
      if (!(locals.agent instanceof Agent)) {
        throw Error("Not logged in");
      }

      if (!post_uri) {
        throw Error("Post URI not given");
      }

      await locals.agent.deletePost(post_uri);
      return { message: "deleted post", post_uri }
    }
    catch (e) {
      return fail(500);
    }
  },
  "saveDraft": async ({ url, request, locals }) => {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    try {
      await db.insert(schema.DraftPost)
        .values({
          id: crypto.randomUUID(),
          authorDid: locals.user.did,
          content
        })
        .onConflictDoUpdate({
          target: schema.DraftPost.id,
          set: { content }
        });
    }
    catch (e) {
      return fail(500);
    }

  },
  "deleteDraft": async ({ url, request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    try {
      await db.delete(schema.DraftPost).where(eq(schema.DraftPost.id, id));
    }
    catch (e) {
      return fail(500);
    }
  },
  "toggleLikePost": async ({ request, locals }) => {
    const formData = await request.formData();
    const likeUri = formData.get("like_uri") as string;
    const cid = formData.get("post_cid") as string;
    const uri = formData.get("post_uri") as string;

    const agent = locals.agent;
    if (agent instanceof Agent) {
      if (!likeUri) {
        const { uri: newLikeUri } = await agent.like(uri, cid);
        return { message: "liked", uri, likeUri: newLikeUri }
      }
      else {
        await agent.deleteLike(likeUri);
        return { message: "unliked", uri, likeUri: "" }
      }
    }
  },
  "toggleRepostPost": async ({ request, locals }) => {
    const formData = await request.formData();
    const repostUri = formData.get("repost_uri") as string;
    const cid = formData.get("post_cid") as string;
    const uri = formData.get("post_uri") as string;

    const agent = locals.agent;
    if (agent instanceof Agent) {
      if (!repostUri) {
        const { uri: newRepostUri } = await agent.repost(uri, cid);
        return { message: "reposted", uri, repostUri: newRepostUri }
      }
      else {
        await agent.deleteRepost(repostUri);
        return { message: "unrepost", uri, repostUri: "" }
      }
    }
  },
  "bookmarkPost": async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401);
    }

    const formData = await request.formData();
    const uri = formData.get("post_uri") as string;
    const isBookmarked = formData.get("is_bookmarked") as string;

    if (isBookmarked === "false") {
      const bookmark = await db.insert(schema.Bookmark)
        .values({
          id: crypto.randomUUID(),
          uri,
          authorDid: locals.user.did,
        })
        .returning();

      locals.bookmarks.add(bookmark[0].uri ?? "");
      return { message: "bookmarked", uri };
    }
    else {
      const removed = await db.delete(schema.Bookmark)
        .where(and(
          eq(schema.Bookmark.authorDid, locals.user.did),
          eq(schema.Bookmark.uri, uri)
        ))
        .returning();
      locals.bookmarks.delete(removed[0].uri ?? "");
      return { message: "unbookmarked", uri };
    }

  }
};
