import { atclient } from "$lib/server/client";
import { Agent, AtpAgent } from "@atproto/api";

import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/schema";
import { decryptToString } from "$lib/server/crypts";
import { decodeBase64, decodeBase64urlIgnorePadding } from "@oslojs/encoding";

import type { Handle } from "@sveltejs/kit";
import { MYB_PASSWORD } from "$env/static/private";

export const handle: Handle = async ({ event, resolve }) => {
  const sid = event.cookies.get("sid");
  if (sid) {
    if (event.locals.user) { return resolve(event); }
    const decoded = decodeBase64urlIgnorePadding(sid);
    const key = decodeBase64(MYB_PASSWORD);
    const decrypted = await decryptToString(key, decoded);
    const oauthSession = await atclient.restore(decrypted);

    const agent = new Agent(oauthSession);
    event.locals.agent = agent;

    const user = await agent.getProfile({ actor: decrypted });
    event.locals.user = user.data;
    const preferences = await agent.getPreferences();
    event.locals.preferences = preferences;


    const bookmarks = await db.query.Bookmark.findMany({
      where: eq(schema.Bookmark.authorDid, user.data.did)
    });
    event.locals.bookmarks = new Set(bookmarks.map((b) => b.uri ?? ""));
  }
  else {
    if (event.locals.agent) { return resolve(event); }
    const agent = new AtpAgent({ service: "https://api.bsky.app" });
    event.locals.agent = agent;
  }

  return resolve(event);
};
