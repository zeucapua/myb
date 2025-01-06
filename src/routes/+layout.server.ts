import type { LayoutServerLoadEvent } from "./$types";

export async function load({ locals }: LayoutServerLoadEvent) {
  const user = locals.user;
  const bookmarks = locals.bookmarks ?? new Set<string>();
  return { user, bookmarks }
}

