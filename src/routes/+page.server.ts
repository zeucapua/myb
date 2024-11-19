import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/schema";
import { atclient } from "$lib/server/client";
import { isValidHandle } from "@atproto/syntax";
import { Agent, AtpBaseClient, RichText } from "@atproto/api";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  "login": async ({ request }) => {
    const formData = await request.formData();
    const handle = formData.get("handle") as string;
    if (!isValidHandle(handle)) { error(400, { message: "invalid handle" }); }

    const url = await atclient.authorize(handle, { scope: "atproto transition:generic" });
    if (!url) {
      error(500);
    }
    redirect(301, url.toString());
  },
  "logout": async ({ cookies }) => {
    cookies.delete("sid", { path: "/" });
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
        createdAt: new Date().toISOString()
      });
    }

    if (draftId) {
      await db.delete(schema.DraftPost).where(eq(schema.DraftPost.id, draftId));
    }
  },
  "saveDraft": async ({ request, locals }) => {
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
  "deleteDraft": async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    try {
      await db.delete(schema.DraftPost).where(eq(schema.DraftPost.id, id));
    }
    catch (e) {
      return fail(500);
    }
  },
  "likePost": async ({ request, locals }) => {
    const formData = await request.formData();
    const cid = formData.get("post_cid") as string;
    const uri = formData.get("post_uri") as string;

    const agent = locals.agent;
    if (agent instanceof AtpBaseClient) {
      return fail(401); 
    }

    if (agent instanceof Agent) {
      await agent.like(uri, cid);
      return { success: true }
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
