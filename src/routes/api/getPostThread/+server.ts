import { AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyFeedDefs, AppBskyGraphDefs, AtpBaseClient } from "@atproto/api";
import { renderTextToMarkdownToHTML } from "$lib/utils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { validateThreadViewPost, type ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export const GET: RequestHandler = async ({ url }) => {
  const queryParams = url.searchParams;
  const uri = queryParams.get("uri");
  if (!uri) {
    error(500, "No record URI given");
  }
  const agent = new AtpBaseClient({ service: "https://api.bsky.app" });

  const response = await agent.app.bsky.feed.getPostThread({ uri, depth: 1 });
  const { thread } = response.data as { thread: ThreadViewPost };

  // @ts-ignore
  thread.post.html = await renderTextToMarkdownToHTML(thread.post.record.text, agent);
  if (thread.post.embed && AppBskyEmbedRecord.isView(thread.post.embed) && !(
    AppBskyGraphDefs.isListView(thread.post.embed)
    && AppBskyGraphDefs.isStarterPackViewBasic(thread.post.embed)
    && AppBskyFeedDefs.isGeneratorView(thread.post.embed)
  )) {
    // @ts-ignore
    thread.post.embed.record.html = await renderTextToMarkdownToHTML(thread.post.embed.record.value.text, agent);
  }
  else if (AppBskyEmbedRecordWithMedia.isView(thread.post.embed)) {
    // @ts-ignore
    thread.post.embed.record.record.html = await renderTextToMarkdownToHTML(thread.post.embed.record.record.value.text, agent);
  }

  if (thread.parent) {
    // @ts-ignore
    thread.parent.html = await renderTextToMarkdownToHTML(thread.parent.post.record.text, agent);
  }

  if (thread.replies) {
    for (const reply of thread.replies) {
      if (validateThreadViewPost(reply)) {
        // @ts-ignore
        reply.html = await renderTextToMarkdownToHTML(reply.post.record.text, agent);
      }
    }
  }
  return json(thread);
};
