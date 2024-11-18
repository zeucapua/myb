import { renderTextToMarkdownToHTML } from "$lib/utils";
import { AtpBaseClient } from "@atproto/api";
import { error, json, type RequestHandler } from "@sveltejs/kit";

// Given a actor DID, return the profile 
export const GET: RequestHandler = async ({ url }) => {
  const agent = new AtpBaseClient({ service: "https://api.bsky.app" });

  const queryParams = url.searchParams;
  const actor = queryParams.get("actor");
  if (!actor) {
    return error(500, "Actor DID not given");
  }

  const { data } = await agent.app.bsky.actor.getProfile({ actor });
  // @ts-ignore
  data.description = await renderTextToMarkdownToHTML(data.description || "", agent);
  return json({ profile: data });
}
