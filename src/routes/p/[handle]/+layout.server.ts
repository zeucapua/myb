import { error } from "@sveltejs/kit";
import { HandleResolver } from "@atproto/identity";
import type { LayoutServerLoadEvent } from "./$types";
import { Agent, AtpBaseClient } from "@atproto/api";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { renderTextToMarkdownToHTML } from "$lib/utils";

export async function load({ locals, params }: LayoutServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { error(500, { message: "Agent not found" }); }

  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(params.handle.toLowerCase()) as string;

  if (!did) { error(500, "Handle not resolved to DID"); }

  if (agent instanceof AtpBaseClient) {
    const { data }: { data: ProfileViewDetailed } = await agent.app.bsky.actor.getProfile({ actor: did });
    // @ts-ignore
    data.description = await renderTextToMarkdownToHTML(data.description || "", agent);
    return { profile: data }
  }
  else if (agent instanceof Agent) {
    const { data }: { data: ProfileViewDetailed } = await agent.getProfile({ actor: did });
    // @ts-ignore
    data.description = await renderTextToMarkdownToHTML(data.description || "", agent);
    return { profile: data }
  }
  return { profile: undefined }
}
