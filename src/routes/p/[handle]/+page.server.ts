import { error, type Actions } from "@sveltejs/kit";
import { HandleResolver } from "@atproto/identity";
import { Agent } from "@atproto/api";

export const actions: Actions = {
  "followUser": async ({ params, locals }) => {
    const agent = locals.agent;
    if (!(agent instanceof Agent)) {
      error(401, "Need to log in to follow");
    }

    const handle = params.handle as string; 
    const handleResolver = new HandleResolver({});
    const did = await handleResolver.resolve(handle);

    if (!did) { error(500, "Handle not resolved to DID"); }

    await agent.follow(did);
    return { status: "followed" };
  },
  "unfollowUser": async ({ locals, request }) => {
    const agent = locals.agent;
    if (!(agent instanceof Agent)) {
      error(401, "Need to log in to follow");
    }

    const formData = await request.formData();
    const followUri = formData.get("follow_uri") as string;

    if (!followUri) {
      error(500, "No follow URI to delete");
    }

    try {
      await agent.deleteFollow(followUri);
      return { status: "deletedFollow" };
    }
    catch {
      error(500, "Internal error");
    }
  }
}

