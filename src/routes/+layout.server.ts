import { type ServerLoadEvent } from "@sveltejs/kit";

export async function load({ cookies, locals }: ServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { return { profile: undefined }};

  const profile = await agent.getProfile({ actor: cookies.get("sid") as string });

  return { profile: profile.data }
}
