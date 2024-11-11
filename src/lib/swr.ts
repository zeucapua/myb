import { useSWR } from "sswr";
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export const DISCOVER_FEED_AT_URL = "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot"; 

export function getFeedTimeline({ url }: { url: string }) {
  const { data, error, mutate, isLoading } = useSWR<FeedViewPost[]>(url, { keepPreviousData: true })
  return { data, error, mutate, isLoading };
}

export function getAuthorFeed({ actor }: { actor: string }) {
  const { data, error, mutate, isLoading } = useSWR<FeedViewPost[]>(actor, { keepPreviousData: true })
  return { data, error, mutate, isLoading };
}
