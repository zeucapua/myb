import { renderTextToMarkdownToHTML } from "$lib/utils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyFeedDefs, AppBskyGraphDefs } from "@atproto/api";

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
  const cursor = queryParams.get("cursor") || undefined;

	console.log({ queryParams });

  if (!feed) {
    return error(500, "Feed URI not given");
  }

  const { data } = await agent.app.bsky.feed.getFeed({ feed, limit, cursor });

  for (const post of data.feed) {
    // @ts-ignore
    post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);

    if (post.post.embed && AppBskyEmbedRecord.isView(post.post.embed) && !(
      AppBskyGraphDefs.isListView(post.post.embed)
      && AppBskyGraphDefs.isStarterPackViewBasic(post.post.embed)
      && AppBskyFeedDefs.isGeneratorView(post.post.embed)
    )) {
      // @ts-ignore
      post.post.embed.record.html = await renderTextToMarkdownToHTML(post.post.embed.record.value.text || "", agent);
    }
    else if (AppBskyEmbedRecordWithMedia.isView(post.post.embed)) {
      // @ts-ignore
      post.post.embed.record.record.html = await renderTextToMarkdownToHTML(post.post.embed.record.record.value.text || "", agent);
    }
  }

  return json({ feed: data.feed, nextCursor: data.cursor });
}
