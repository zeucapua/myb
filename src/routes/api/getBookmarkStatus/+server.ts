import { db } from "$lib/server/db";
import * as schema from "$lib/schema";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ url, locals }) => {
  const user = locals.user;

  if (!user) {
    return error(401, "Unauthorized API call");
  }
  
  const queryParams = url.searchParams;
  const uri = queryParams.get("uri") as string;

  const bookmark = await db.query.Bookmark.findFirst({
    where: eq(schema.Bookmark.uri, uri)
  });

  return json({ isBookmark: !!bookmark });
}
