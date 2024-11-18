import { error } from "@sveltejs/kit";
import { HandleResolver } from "@atproto/identity";
import type { LayoutServerLoadEvent } from "./$types";

export async function load({ locals, params }: LayoutServerLoadEvent) {
  const agent = locals.agent;
  if (!agent) { error(500, { message: "Agent not found" }); }

  const handleResolver = new HandleResolver({});
  const did = await handleResolver.resolve(params.handle.toLowerCase()) as string;

  if (!did) { error(500, "Handle not resolved to DID"); }

  return { did };
}
