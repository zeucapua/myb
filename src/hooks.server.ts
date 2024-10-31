import { atclient } from "$lib/server/client";
import { Agent } from "@atproto/api";
import type { Handle } from "@sveltejs/kit";
import { decodeBase64, decodeBase64urlIgnorePadding } from "@oslojs/encoding";
import { decryptToString } from "$lib/server/crypts";
import { MYB_PASSWORD } from "$env/static/private";

export const handle: Handle = async ({ event, resolve }) => {
  const sid = event.cookies.get("sid");
  if (sid) { 
    const decoded = decodeBase64urlIgnorePadding(sid);
    const key = decodeBase64(MYB_PASSWORD);
    const decrypted = await decryptToString(key, decoded); 
    const oauthSession = await atclient.restore(decrypted);
    const agent = new Agent(oauthSession);
    event.locals.agent = agent;
  }

  return resolve(event);
};
