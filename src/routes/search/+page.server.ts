import { Agent, AtpBaseClient } from "@atproto/api";
import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  "searchHandle": async ({ locals, request }) => {
    const formData = await request.formData();
    const handle = formData.get("handle") as string;

    if (locals.agent instanceof Agent) {
      const actors = await locals.agent.searchActors({ q: handle });
      return { actors: actors.data.actors, success: actors.success };
    }
    else if (locals.agent instanceof AtpBaseClient) {
      const actors = await locals.agent.app.bsky.actor.searchActors({ q: handle });
      return { actors: actors.data.actors, success: actors.success };
    }
  }
}
