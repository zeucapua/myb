// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Agent } from "@atproto/api";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      agent: Agent | undefined;
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
