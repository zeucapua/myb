import { type ServerLoadEvent } from "@sveltejs/kit";

export async function load({ locals }: ServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { return { profile: undefined }};

  const profile = await agent.getProfile({ actor: agent.assertDid });

  return { profile: profile.data }
}
