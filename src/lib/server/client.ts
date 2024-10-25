import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { db as database } from "./db";
import { SessionStore, StateStore } from "./storage";
import { dev } from "$app/environment";

export const createClient = async (db: typeof database) => {
  const publicUrl = "https://myb.zeu.dev";
  const url = dev ? "http://localhost:5173" : publicUrl;
  return new NodeOAuthClient({
    stateStore: new StateStore(db),
    sessionStore: new SessionStore(db),
    clientMetadata: {
      client_name: "myb",
      client_id: !dev ? `${url}/client-metadata.json` 
        : `http://localhost:5173?redirect_uri=${
          encodeURIComponent(`${url}/oauth/callback`)
        }&scope=${
          encodeURIComponent('atproto transition:generic')
      }`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true
    },
  })
};
