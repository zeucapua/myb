import posthog from "posthog-js";
import { browser } from "$app/environment";
import type { LayoutServerLoadEvent } from "./$types";
import { POSTHOG_API_KEY } from "$env/static/private";

export async function load({ locals }: LayoutServerLoadEvent) {
  if (browser) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: "https://us.i.posthog.com",
        person_profiles: "always"
    });
  }

  const user = locals.user;
  return { user }
}
