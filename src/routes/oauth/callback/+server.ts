import { atclient } from "$lib/server/client";
import { error, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "../../$types";
import { MYB_PASSWORD } from "$env/static/private";
import { encryptString } from "$lib/server/crypts";
import { decodeBase64, encodeBase64urlNoPadding } from "@oslojs/encoding";

export async function GET({ request, cookies }: RequestEvent) {
  const params = new URLSearchParams(request.url.split("?")[1]);
  try {
    const { session } = await atclient.callback(params)
    const key = decodeBase64(MYB_PASSWORD);
    const encrypted = await encryptString(key, session.did);
    const encoded = encodeBase64urlNoPadding(encrypted);
    const stayLoggedIn = cookies.get("stayLoggedIn") === "true";
    const maxAge = !stayLoggedIn && 60 * 60;

    cookies.set("sid", encoded, { 
      path: "/", 
      httpOnly: true,
      sameSite: "lax",
      ...(maxAge && { maxAge })
    });
  } catch (err) {
    console.log(err);
    error(500, { message: (err as Error).message });
  }

  redirect(301, "/");
}
