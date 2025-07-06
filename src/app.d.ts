// See https://svelte.dev/docs/kit/types#app.d.ts

import * as schema from "$lib/schema";
import type { Agent, AtpAgent, BskyPreferences } from "@atproto/api";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      agent: Agent | AtpAgent | undefined;
      user: ProfileViewDetailed;
      bookmarks: Set<string>;
      preferences: BskyPreferences;
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
