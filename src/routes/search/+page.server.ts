import { renderTextToMarkdownToHTML } from "$lib/utils";
import { Agent, AtpBaseClient } from "@atproto/api";
import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  "searchHandle": async ({ locals, request }) => {
    const formData = await request.formData();
    const handle = formData.get("handle") as string;
    const agent = locals.agent;

    if (agent instanceof Agent) {
      const actors = await agent.searchActors({ q: handle });
      for (const actor of actors.data.actors) {
        actor.description = await renderTextToMarkdownToHTML(actor.description as string, agent);
      };
      return { actors: actors.data.actors, success: actors.success };
    }
    else if (agent instanceof AtpBaseClient) {
      const actors = await agent.app.bsky.actor.searchActors({ q: handle });
      for (const actor of actors.data.actors) {
        actor.description = await renderTextToMarkdownToHTML(actor.description as string, agent);
      };
      return { actors: actors.data.actors, success: actors.success };
    }
  }
}
