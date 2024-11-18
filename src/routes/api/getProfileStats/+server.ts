import { subDays, compareAsc } from "date-fns";
import { DidResolver, HandleResolver, getPds } from "@atproto/identity";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import type { Record } from "@atproto/api/dist/client/types/com/atproto/repo/listRecords";
import { AtpBaseClient } from "@atproto/api";
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

// Given a cursor and limit (opt)
// Return a JSON of FeedViewPost
export const GET: RequestHandler = async ({ url }) => {
  const queryParams = url.searchParams;
  const handle = queryParams.get("handle") as string;
  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(handle);

  if (!did) { error(500, "Handle not resolved to DID"); }
  const days = Number(queryParams.get("days")) || 7;
  
  // get all records
  const listRecordsUrl = new URL("https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed");
  listRecordsUrl.searchParams.set("actor", did);

  const response = await fetch(listRecordsUrl.toString());
  const parsed = await response.json();

  // filter by date and remove replies
  const records = parsed.feed.filter((r: FeedViewPost) => 
    !(Object.keys(r).find((e) => e === "reply"))
    && !(r.reason && r.reason.$type === "app.bsky.feed.defs#reasonRepost")
    && compareAsc(
      // @ts-ignore
      new Date(r.post.record.createdAt),
      subDays(new Date(), days)
    ) >= 1
  ) as FeedViewPost[];

  // render post to html
  for (const post of records) {
    // @ts-ignore
    post.html = await renderTextToMarkdownToHTML(post.post.record.text, locals.agent);
  }

  // order by top skeet
  records.sort((a, b) => {
    const aEngagement = a.post.likeCount! + a.post.replyCount! + a.post.repostCount! + a.post.quoteCount!;
    const bEngagement = b.post.likeCount! + b.post.replyCount! + b.post.repostCount! + b.post.quoteCount!;

    if (aEngagement > bEngagement) { return -1; }
    else if (bEngagement > aEngagement) { return 1; }
    else { return 0; }
  });

  const likes = records.reduce((accumulator, current) => {
    return accumulator 
      + current.post.likeCount! 
  }, 0);

  const reposts = records.reduce((accumulator, current) => {
    return accumulator 
      + current.post.repostCount! 
  }, 0);

  const replies = records.reduce((accumulator, current) => {
    return accumulator 
      + current.post.replyCount! 
  }, 0);

  const quotes = records.reduce((accumulator, current) => {
    return accumulator 
      + current.post.quoteCount! 
  }, 0);

  return json({ records, likes, reposts, replies, quotes });
}
