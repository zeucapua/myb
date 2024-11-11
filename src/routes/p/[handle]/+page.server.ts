import { error } from "@sveltejs/kit";
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
    const feed = await agent.getAuthorFeed({ actor: did });

    for (const post of feed.data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, agent);
    }

    return { profile: profile.data, feed: JSON.stringify(feed.data.feed) } 
  }
  else if (agent instanceof AtpBaseClient) {
    const profile = await agent.app.bsky.actor.getProfile({ actor: did });
    profile.data.description = await renderTextToMarkdownToHTML(profile.data.description as string, agent);
    const feed = await agent.app.bsky.feed.getAuthorFeed({ actor: did });

    for (const post of feed.data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, agent);
    }

    return { profile: profile.data, feed: JSON.stringify(feed.data.feed) } 
  }
}

