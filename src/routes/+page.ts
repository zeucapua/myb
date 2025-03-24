import { savedFeedsToUriArrays, type BskyPreferences } from "@atproto/api";
import type { PageLoadEvent } from "./$types";
import { parseAtUri } from "$lib/utils";
import type { LoadEvent } from "@sveltejs/kit";

export async function load(event: LoadEvent) {
  let agent = event.data?.agent;
  let preferences = event.data?.preferences as BskyPreferences;

  let pinnedFeeds = [] as { value: string, label: string }[];
  if (preferences) {
    // TODO: implement feeds in user database
    let { pinned, saved } = savedFeedsToUriArrays(preferences.savedFeeds);
    for (const uri of pinned) {
      if (!Object.values(parseAtUri(uri)).includes(undefined)) {
        const generator = await agent!.app.bsky.feed.getFeedGenerator({ feed: uri });
        if (generator.data.isValid && generator.data.isOnline) {
          pinnedFeeds.push({
            value: uri,
            label: generator.data.view.displayName
          });
        }
      }
    }
  }

  return { pinnedFeeds };
}

