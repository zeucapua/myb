# myb: custom bsky client

an open source Bluesky web client. 

### ⚠️ Note this is in _ALPHA_

Functionality is priority, styling second, so if the UI/UX is a little unintuitive, 
please know it is subject to change as more users try it out! If you find bugs or want features not listed above,
please send a GitHub issue my way!

[![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/zeucapua)

## Features
- [x] Login/Logout via OAuth
- [x] Profile pages
  - [x] Search users
  - [x] Show Description
  - [x] Copy DID/Handle
  - [x] Open handle domain site
  - [x] Follow/Unfollow user
  - [x] Skeets Stats Page
- [ ] Posts
  - [x] Render posts' facets
  - [x] Embeds
  - [x] Draft posts
  - [x] Bookmark posts
  - [x] Like/Unlike
  - [x] Repost
  - [ ] Quote Post
  - [ ] Comment
  - [x] Post page (`/p/<handle>/<record>`)
  - [ ] [Draft + Publish Threads](https://github.com/zeucapua/myb/issues/1)
  - [ ] CRON-based scheduled posting
- [ ] Feeds
  - [x] Post pagination
  - [x] Toggle reposts/replies
  - [x] Read 'Following' + 'Discovery'
  - [ ] Read any feed given URI

## Contributor Guide (WIP)

### Tech Stack
- [Svelte(Kit)](https://svelte.dev): JS UI and meta framework
- [Drizzle](https://orm.drizzle.team): Database ORM
- [Turso](https://turso.tech): SQLite hosted service
- [Bits-UI](https://bits-ui.com): Svelte component library
- [`@atproto/api`](https://github.com/bluesky-social/atproto/tree/main/packages/api): AT protocol SDK
- [`@atproto/oauth-client-node`](https://www.npmjs.com/package/@atproto/oauth-client-node): AT Protocol Node Oauth library
- [TanStack Query (Svelte)](https://tanstack.com/query/latest/docs/framework/svelte/overview): async state management/data fetching solution

