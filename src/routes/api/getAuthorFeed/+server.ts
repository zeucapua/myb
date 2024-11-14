import { renderTextToMarkdownToHTML } from "$lib/utils";
import { Agent, AtpBaseClient } from "@atproto/api";
import { error, json, type RequestHandler } from "@sveltejs/kit";

// Given a actor DID, cursor and limit (opt)
// Return a JSON of FeedViewPost
export const GET: RequestHandler = async ({ url, locals }) => {
  const agent = locals.agent;

  const queryParams = url.searchParams;
  const actor = queryParams.get("actor");
  if (!actor) {
    return error(500, "Actor DID not given");
  }

  const cursor = queryParams.get("cursor") as string || "";
  const limit = Number(queryParams.get("limit")) || 10;

  if (agent instanceof Agent) {
    const { data } = await agent.getAuthorFeed({ actor, cursor, limit });
    for (const post of data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
    }
    return json({ feed: data.feed, nextCursor: data.cursor });
  }
  else if (agent instanceof AtpBaseClient) {
    const { data } = await agent.app.bsky.feed.getAuthorFeed({ actor, cursor, limit });
    for (const post of data.feed) {
      // @ts-ignore
      post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
    }
    return json({ feed: data.feed, nextCursor: data.cursor });
  }

  return error(500, "Internal Error");
}
