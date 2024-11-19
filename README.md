# myb: custom bsky client

## Tech Stack
- Svelte(Kit): JS UI and meta framework
- Drizzle: Database ORM
- Turso: SQLite hosted service
- Bits-UI: Svelte component library
- `@atproto/api` and `@atproto/oauth-client-node`: AT protocol SDK and OAuth libraries

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
  - [x] Draft posts
  - [ ] Bookmark posts
  - [ ] CRON-based scheduled posting
  - [ ] Like/Unlike
  - [ ] Repost + Quote Post
  - [ ] Comment
  - [ ] [Draft + Publish Threads](https://github.com/zeucapua/myb/issues/1)
- [ ] Feeds
  - [x] Post pagination
  - [x] Toggle reposts/replies
  - [x] Read 'Following' + 'Discovery'
  - [ ] Read any feed given URI
     

### ⚠️ Note this is in _ALPHA_

Functionality is priority, styling second, so if the UI/UX is a little unintuitive, please know it is subject to change as more users try it out! If you find bugs or want features not listed above, please send a GitHub issue my way!
