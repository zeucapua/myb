import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'
import { eq } from 'drizzle-orm';
import { db as database } from './db'
import * as schema from "$lib/schema";

export class StateStore implements NodeSavedStateStore {
  constructor(private db: typeof database) {}
  async get(key: string): Promise<NodeSavedState | undefined> {
    const result = await this.db.query.AuthState.findFirst({
      where: eq(schema.AuthState.key, key)
    });
    if (!result) return
    return JSON.parse(result.state as string) as NodeSavedState
  }
  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val)
    await this.db.insert(schema.AuthState)
      .values({
        key,
        state
      })
      .onConflictDoUpdate({ 
        target: schema.AuthState.key,
        set: { state }
      });
  }
  async del(key: string) {
    await this.db.delete(schema.AuthState).where(eq(schema.AuthState.key, key));
  }
}

export class SessionStore implements NodeSavedSessionStore {
  constructor(private db: typeof database) {}
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const result = await this.db.query.AuthSession.findFirst({
      where: eq(schema.AuthSession.key, key)
    });
    if (!result) return
    return JSON.parse(result.session as string) as NodeSavedSession
  }
  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val)
    await this.db.insert(schema.AuthSession)
      .values({ key, session })
      .onConflictDoUpdate({
        target: schema.AuthSession.key,
        set: { session }
      });
  }
  async del(key: string) {
    await this.db.delete(schema.AuthSession).where(eq(schema.AuthSession.key, key));
  }
}
