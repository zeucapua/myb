import { error } from "@sveltejs/kit";
import { Agent, AtpBaseClient } from "@atproto/api";
import type { PageServerLoadEvent } from "./$types";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

export async function load({ locals, params }: PageServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { error(500, { message: "Agent not found" }); }

  if (agent instanceof Agent) {
    const results = await agent.searchActors({ q: params.handle });
    if (results.data.actors.length !== 1) {
      error(500, { message: "Handle not specific" });
    }

    const actor = results.data.actors[0] as ProfileView;
    const profile = await agent.getProfile({ actor: actor.did });
    const feed = await agent.getAuthorFeed({ actor: actor.did });
    return { result: profile.data, feed: JSON.stringify(feed.data.feed) };
  }
  else if (agent instanceof AtpBaseClient) {
    const results = await agent.app.bsky.actor.searchActors({ q: params.handle });

    if (results.data.actors.length !== 1) {
      error(500, { message: "Handle not specific" });
    }

    const actor = results.data.actors[0] as ProfileView;
    const profile = await agent.app.bsky.actor.getProfile({ actor: actor.did });
    const feed = await agent.app.bsky.feed.getAuthorFeed({ actor: actor.did });
    return { result: profile.data, feed: JSON.stringify(feed.data.feed) };
  }
}
