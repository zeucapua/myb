import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const AuthSession = sqliteTable('auth_session', {
  key: text("key", { mode: "text" }).primaryKey(),
  session: text("key", { mode: "json" }).notNull()
});

export const AuthState = sqliteTable('auth_state', {
  key: text("key", { mode: "text" }).primaryKey(),
  state: text("key", { mode: "json" }).notNull()
});

export const Bookmark = sqliteTable("bookmark", {
  uri: text("uri", { mode: "text" }).primaryKey(),
  authorDid: text("author_did", { mode: "text" }).notNull(),
  link: text("link", { mode: "text" }).notNull()
});
