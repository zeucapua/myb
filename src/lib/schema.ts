import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const AuthSession = sqliteTable('auth_session', {
  key: text("key", { mode: "text" }).primaryKey().unique(),
  session: text("session", { mode: "json" }).notNull()
});

export const AuthState = sqliteTable('auth_state', {
  key: text("key", { mode: "text" }).primaryKey().unique(),
  state: text("state", { mode: "json" }).notNull()
});

export const DraftPost = sqliteTable("draft_post", {
  id: text("id", { mode: "text" }).primaryKey().unique(),
  content: text("content", { mode: "text" }).notNull(),
  authorDid: text("author_did", { mode: "text" }).notNull(),
});

export const Bookmark = sqliteTable("bookmark", {
  id: text("id", { mode: "text" }).primaryKey().unique(),
  uri: text("uri", { mode: "text" }),
  // who's bookmark is it?
  authorDid: text("author_did", { mode: "text" }).notNull(),
});
