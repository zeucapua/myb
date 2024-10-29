import { atclient } from "$lib/server/client";
import { Agent } from "@atproto/api";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const sid = event.cookies.get("sid");
  if (sid) { 
    const oauthSession = await atclient.restore(sid);
    const agent = new Agent(oauthSession);
    event.locals.agent = agent;
  }

  return resolve(event);
};
