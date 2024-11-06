import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import * as schema from "$lib/schema";
import type { PageServerLoadEvent } from "../$types";

export async function load({ locals }: PageServerLoadEvent) {
  const user = locals.user;
  if (!user) { 
    error(401, "Not logged in");
  }

  const drafts = await db.query.DraftPost.findMany({
    where: eq(schema.DraftPost.authorDid, user.did)
  });

  return { drafts };
}
