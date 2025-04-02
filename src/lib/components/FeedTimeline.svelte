<script lang="ts">
  import PostItem from './PostItem.svelte';
  import { type Snippet } from 'svelte';
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

  type Props = {
    feed: FeedViewPost[];
		showReplies: boolean;
		showReposts: boolean;
		children?: Snippet;
  }

  let { feed, children, showReposts = $bindable(true), showReplies = $bindable(true) }: Props = $props();
</script>

<ol class="relative flex flex-col h-full max-w-screen md:max-w-3xl divide-y divide-slate-700">
  {#each feed as post: FeedPost}
    {#if !(post.reason && !showReposts) && !(post.reply && !showReplies)}
      <li>
        <PostItem data={post} />
      </li>
    {/if}
  {/each}

	{@render children?.()}
</ol>
