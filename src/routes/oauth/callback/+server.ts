import { atclient } from "$lib/server/client";
import { error, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "../../$types";

export async function GET({ request, cookies }: RequestEvent) {
  const params = new URLSearchParams(request.url.split("?")[1]);
  try {
    const { session } = await atclient.callback(params)
    cookies.set("sid", session.did, { path: "/", maxAge: 60 * 60, httpOnly: true, sameSite: "lax" });
  } catch (err) {
    console.log(err);
    error(500, { message: (err as Error).message });
  }

  redirect(301, "/");
}
