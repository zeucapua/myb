import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { isValidHandle } from "@atproto/syntax";
import { atclient } from "$lib/server/client";
import { Agent, RichText } from "@atproto/api";
import { db } from "$lib/server/db";
import * as schema from "$lib/schema";
import type { PageServerLoadEvent } from "./$types";
import { eq } from "drizzle-orm";

export async function load({ locals }: PageServerLoadEvent) {
  const user = locals.user;
  if (!user) { return { drafts: [] }}

  const drafts = await db.query.DraftPost.findMany({
    where: eq(schema.DraftPost.authorDid, user.did)
  });

  return { drafts };
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
  }
};
