// See https://svelte.dev/docs/kit/types#app.d.ts

import * as schema from "$lib/schema";
import type { Agent, AtpBaseClient } from "@atproto/api";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      agent: Agent | AtpBaseClient | undefined;
      user: ProfileViewDetailed;
      bookmarks: Set<string>;
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
    
	}

  type ViewEmbed =
    | AppBskyEmbedRecord.View
    | AppBskyEmbedImages.View
    | AppBskyEmbedVideo.View
    | AppBskyEmbedExternal.View
    | AppBskyEmbedRecordWithMedia.View
    | {$type: string; [k: string]: unknown}

  type MainEmbed =
    | AppBskyEmbedRecord.Main
    | AppBskyEmbedImages.Main
    | AppBskyEmbedVideo.Main
    | AppBskyEmbedExternal.Main
    | AppBskyEmbedRecordWithMedia.Main
    | {$type: string; [k: string]: unknown}
}


export {};
