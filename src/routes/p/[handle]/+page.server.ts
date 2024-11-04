import { marked } from "marked";
import { error } from "@sveltejs/kit";
import { HandleResolver } from "@atproto/identity";
import { Agent, AtpBaseClient, RichText } from "@atproto/api";
import type { PageServerLoadEvent } from "./$types";
import { dev } from "$app/environment";

export async function load({ locals, params }: PageServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { error(500, { message: "Agent not found" }); }

  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(params.handle);

  if (!did) { error(500, "Handle not resolved to DID"); }

  if (agent instanceof Agent) {
    const profile = await agent.getProfile({ actor: did });
    const feed = await agent.getAuthorFeed({ actor: did });

    for (const post of feed.data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, agent);
    }

    return { profile: profile.data, feed: JSON.stringify(feed.data.feed) } 
  }
  else if (agent instanceof AtpBaseClient) {
    const profile = await agent.app.bsky.actor.getProfile({ actor: did });
    const feed = await agent.app.bsky.feed.getAuthorFeed({ actor: did });

    for (const post of feed.data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, agent);
    }

    return { profile: profile.data, feed: JSON.stringify(feed.data.feed) } 
  }
}

async function renderTextToMarkdownToHTML(text: string, agent: Agent | AtpBaseClient) {
  const rt = new RichText({ text });
  await rt.detectFacets(agent);
  let markdown = "";
  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      markdown += `[${segment.text}](${segment.link?.uri})`
    } 
    else if (segment.isMention()) {
      let profile;
      if (agent instanceof Agent) {
        profile = await agent.getProfile({ actor: segment.mention?.did || "" });
      }
      else {
        profile = await agent.app.bsky.actor.getProfile({ actor: segment.mention?.did || "" });
      }
      markdown += `[${segment.text}](${dev ? "http://localhost:5173" : "https://myb.zeu.dev" }/p/${profile.data.handle})`
    } 
    else {
      markdown += segment.text
    }
  }

  const html = await marked.parse(markdown);
  return html;
}
