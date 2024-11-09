import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { isValidHandle } from "@atproto/syntax";
import { atclient } from "$lib/server/client";
import { Agent, AtpBaseClient, RichText } from "@atproto/api";
import { db } from "$lib/server/db";
import * as schema from "$lib/schema";
import type { PageServerLoadEvent } from "./$types";
import { eq } from "drizzle-orm";
import { renderTextToMarkdownToHTML } from "$lib/utils";

export async function load({ locals }: PageServerLoadEvent) {
  if (locals.agent instanceof Agent) {
    const { data } = await locals.agent.getTimeline();

    for (const post of data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
    }

    return { feed: JSON.stringify(data.feed) };
  }
  else if (locals.agent instanceof AtpBaseClient) {
    const { data } = await locals.agent.app.bsky.feed.getFeed({
      // "Discover" feed
      feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot"
    });

    for (const post of data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
    }

    return { feed: JSON.stringify(data.feed) };
  }
}

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
      return { success: false }
    }

    if (agent instanceof Agent) {
      const { uri: resUri } = await agent.like(uri, cid);
      return { success: true }
    }
  }
};
