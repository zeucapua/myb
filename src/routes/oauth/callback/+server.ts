import { atclient } from "$lib/server/client";
import { getIronSession } from "iron-session";
import type { RequestEvent } from "../../$types";
import { error, redirect } from "@sveltejs/kit";
import { IRON_SESSION_PASSWORD } from "$env/static/private";

type Session = { did: string };

export async function GET({ request }: RequestEvent) {
  const params = new URLSearchParams(request.url.split("?")[1]);
  console.log({ params });
  const response = new Response();
  try {
    const { session } = await atclient.callback(params)
    const clientSession = await getIronSession<Session>(request, response, {
      cookieName: 'sid',
      password: IRON_SESSION_PASSWORD
    })
    clientSession.did = session.did
    await clientSession.save()
    console.log("CALLBACK clientSession:", { did: session.did, clientSession });
  } catch (err) {
    console.log(err);
    error(500, { message: (err as Error).message });
  }

  redirect(301, "/");
}
