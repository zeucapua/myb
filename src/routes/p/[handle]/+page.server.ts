import { error, type Actions } from "@sveltejs/kit";
import { HandleResolver } from "@atproto/identity";
import { Agent, AtpBaseClient } from "@atproto/api";
import type { PageServerLoadEvent } from "./$types";
import { renderTextToMarkdownToHTML } from "$lib/utils";

export async function load({ locals, params }: PageServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { error(500, { message: "Agent not found" }); }

  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(params.handle);

  if (!did) { error(500, "Handle not resolved to DID"); }

  if (agent instanceof Agent) {
    const profile = await agent.getProfile({ actor: did });
    profile.data.description = await renderTextToMarkdownToHTML(profile.data.description as string, agent);
    return { profile: profile.data } 
  }
  else if (agent instanceof AtpBaseClient) {
    const profile = await agent.app.bsky.actor.getProfile({ actor: did });
    profile.data.description = await renderTextToMarkdownToHTML(profile.data.description as string, agent);
    return { profile: profile.data } 
  }
}

export const actions: Actions = {
  "followUser": async ({ params, locals }) => {
    const agent = locals.agent;
    if (!(agent instanceof Agent)) {
      error(401, "Need to log in to follow");
    }

    const handle = params.handle as string; 
    const handleResolver = new HandleResolver({});
    const did = await handleResolver.resolve(handle);

    if (!did) { error(500, "Handle not resolved to DID"); }

    try {
      await agent.follow(did);
      return { status: "followed" };
    }
    catch {
      error(500, "Internal error");
    }
  },
  "unfollowUser": async ({ locals, request }) => {
    const agent = locals.agent;
    if (!(agent instanceof Agent)) {
      error(401, "Need to log in to follow");
    }

    const formData = await request.formData();
    const followUri = formData.get("follow_uri") as string | undefined;

    if (!followUri) {
      error(500, "No follow URI to delete");
    }

    try {
      await agent.deleteFollow(followUri);
      return { status: "followed" };
    }
    catch {
      error(500, "Internal error");
    }
  }
}

