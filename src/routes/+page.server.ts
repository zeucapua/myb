import { error, redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { isValidHandle } from "@atproto/syntax";
import { atclient } from "$lib/server/client";
import { getIronSession } from "iron-session";
import { IRON_SESSION_PASSWORD } from "$env/static/private";
import { Agent } from "@atproto/api";

type Session = { did: string };

export async function load({ request }: ServerLoadEvent) {
  const session = await getIronSession<Session>(request, new Response(), {
    cookieName: 'sid',
    password: IRON_SESSION_PASSWORD
  });
  console.log("server LOAD", { session });
  if (!session.did) return { agent: null }
  try {
    const oauthSession = await atclient.restore(session.did);
    return oauthSession ? new Agent(oauthSession) : null;
  } catch (err) {
    session.destroy()
    return { agent: null }
  }
}

export const actions: Actions = {
  "login": async ({ request }) => {
    const formData = await request.formData();
    const handle = formData.get("handle") as string;
    if (!isValidHandle) { error(400, { message: "invalid handle" }); }

    const url = await atclient.authorize(handle, { scope: "atproto transition:generic" });
    if (!url) {
      error(500);
    }
    redirect(301, url.toString());
  }
};
