import { atclient } from "$lib/server/client";
import { json } from "@sveltejs/kit";

export async function GET() {
  return json(atclient.clientMetadata);
}
