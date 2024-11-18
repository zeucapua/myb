import { renderTextToMarkdownToHTML } from "$lib/utils";
import { Agent, AtpBaseClient } from "@atproto/api";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { error, json, type RequestHandler } from "@sveltejs/kit";

// Given a actor DID, return the profile 
export const GET: RequestHandler = async ({ locals, url }) => {
  const queryParams = url.searchParams;
  const actor = queryParams.get("actor");
  if (!actor) {
    return error(500, "Actor DID not given");
  }

  const agent = locals.agent;

  if (agent instanceof AtpBaseClient) {
    const { data }: { data: ProfileViewDetailed } = await agent.app.bsky.actor.getProfile({ actor });
    // @ts-ignore
    data.description = await renderTextToMarkdownToHTML(data.description || "", agent);
    return json({ profile: data });
  }
  else if (agent instanceof Agent) {
    const { data }: { data: ProfileViewDetailed } = await agent.getProfile({ actor });
    // @ts-ignore
    data.description = await renderTextToMarkdownToHTML(data.description || "", agent);
    return json({ profile: data });
  }

  return error(500, "Internal error");
}
