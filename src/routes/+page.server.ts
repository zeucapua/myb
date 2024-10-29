import { error, redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { isValidHandle } from "@atproto/syntax";
import { atclient } from "$lib/server/client";
import { Agent } from "@atproto/api";

export async function load({ cookies }: ServerLoadEvent) {
  const sid = cookies.get("sid");
  if (!sid) { return { feed: [] }};
  const oauthSession = await atclient.restore(sid);
  const agent = new Agent(oauthSession);
  const authorFeed = await agent.getAuthorFeed({ actor: sid });
  return { feed: JSON.stringify(authorFeed.data.feed) }
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
