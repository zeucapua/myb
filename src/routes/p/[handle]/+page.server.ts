import { error } from "@sveltejs/kit";
import { HandleResolver } from "@atproto/identity";
import { Agent, AtpBaseClient } from "@atproto/api";
import type { PageServerLoadEvent } from "./$types";

export async function load({ locals, params }: PageServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { error(500, { message: "Agent not found" }); }

  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(params.handle);

  if (!did) { error(500, "Handle not resolved to DID"); }

  if (agent instanceof Agent) {
    const profile = await agent.getProfile({ actor: did });
    const feed = await agent.getAuthorFeed({ actor: did });

    return { profile: profile.data, feed: JSON.stringify(feed.data.feed) } 
  }
  else if (agent instanceof AtpBaseClient) {
    const profile = await agent.app.bsky.actor.getProfile({ actor: did });
    const feed = await agent.app.bsky.feed.getAuthorFeed({ actor: did });

    return { profile: profile.data, feed: JSON.stringify(feed.data.feed) } 
  }
}
