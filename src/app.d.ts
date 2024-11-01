// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Agent, AtpBaseClient } from "@atproto/api";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      agent: Agent | AtpBaseClient | undefined;
      profile: ProfileViewDetailed
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
