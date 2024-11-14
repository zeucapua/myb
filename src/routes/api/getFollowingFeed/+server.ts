import { renderTextToMarkdownToHTML } from "$lib/utils";
import { AtpBaseClient } from "@atproto/api";
import { error, json, type RequestHandler } from "@sveltejs/kit";

// Given a cursor and limit (opt)
// Return a JSON of FeedViewPost
export const GET: RequestHandler = async ({ url, locals }) => {
  const agent = locals.agent;
  if (!agent || agent instanceof AtpBaseClient) {
    return error(401, "Unauthorized API call");
  }

  const queryParams = url.searchParams;
  const cursor = queryParams.get("cursor") as string || "";
  const limit = Number(queryParams.get("limit")) || 10;

  const { data } = await agent.getTimeline({ cursor, limit });

  for (const post of data.feed) {
    // @ts-ignore
    post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
  }

  return json({ feed: data.feed, nextCursor: data.cursor });
}
