import { renderTextToMarkdownToHTML } from "$lib/utils";
import { error, json, type RequestHandler } from "@sveltejs/kit";

// Given a feed URI, cursor (?), and limit (opt)
// Return a JSON of FeedViewPost
export const GET: RequestHandler = async ({ url, locals }) => {
  const agent = locals.agent;
  if (!agent) {
    return error(401, "Unauthorized API call");
  }

  const queryParams = url.searchParams;
  const feed = queryParams.get("feed");
  const limit = Number(queryParams.get("limit")) || 10;

  if (!feed) {
    return error(500, "Feed URI not given");
  }

  const { data } = await agent.app.bsky.feed.getFeed({ feed, limit });

  for (const post of data.feed) {
    // @ts-ignore
    post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
  }

  return json({ feed: data.feed, nextCursor: data.cursor });
}
