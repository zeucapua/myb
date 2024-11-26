import { AtpBaseClient } from "@atproto/api";
import type { PageServerLoadEvent } from "./$types";
import { renderTextToMarkdownToHTML } from "$lib/utils";
import { HandleResolver } from "@atproto/identity";
import { error } from "@sveltejs/kit";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

export async function load({ params }: PageServerLoadEvent) {
  const { handle, record } = params;

  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(params.handle.toLowerCase()) as string;

  if (!did) { error(500, "Handle not resolved to DID"); }

  const agent = new AtpBaseClient({ service: "https://api.bsky.app" });
  const author = await agent.app.bsky.actor.getProfile({ actor: did });

  const post = await agent.app.bsky.feed.post.get({ repo: handle, rkey: record });
  post.value.html = await renderTextToMarkdownToHTML(post.value.text, agent);

  return { post: JSON.stringify(post.value), author: author.data as ProfileViewDetailed };
}
