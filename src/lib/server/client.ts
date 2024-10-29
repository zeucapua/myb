import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { db as database } from "./db";
import { SessionStore, StateStore } from "./storage";
import { dev } from "$app/environment";

const publicUrl = "https://myb.zeu.dev";
const url = dev ? "http://[::1]:5173" : publicUrl; // since I'm using ipv6, use ::1 instead 127.0.0.1
const enc = encodeURIComponent;

const createClient = async (db: typeof database) => {
  return new NodeOAuthClient({
    stateStore: new StateStore(db),
    sessionStore: new SessionStore(db),
    clientMetadata: {
      client_name: "myb",
      client_id: !dev ? `${publicUrl}/client-metadata.json` : `http://localhost?redirect_uri=${enc(`${url}/oauth/callback`)}&scope=${enc('atproto transition:generic')}`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true
    }
  })
};

export const atclient = await createClient(database);
