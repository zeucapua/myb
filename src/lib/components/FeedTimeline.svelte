<script lang="ts">
  import PostItem from './PostItem.svelte';
  import { getContext, onDestroy, type Snippet } from 'svelte';
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

  type Props = {
    feed: FeedViewPost[]
  }

  type FeedPost = FeedViewPost & { html: string };
  
  let { feed }: Props = $props();

  let showReposts = $state(true);
  let showReplies = $state(true);

  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  let deleteBottomControl = getContext("deleteBottomControl") as (snippet: Snippet) => void;
  setBottomControls(postToggles);

  onDestroy(() => {
    deleteBottomControl(postToggles);
  });
</script>

{#snippet postToggles()}
  <menu class="flex gap-4 items-center">
    <label class="flex gap-2">
      <input type="checkbox" bind:checked={showReposts} />
      Reposts
    </label>
    <label class="flex gap-2">
      <input type="checkbox" bind:checked={showReplies} />
      Replies
    </label>
  </menu>
{/snippet}


<ol class="flex flex-col">
  {#each feed as post: FeedPost}
    {#if !(post.reason && !showReposts) && !(post.reply && !showReplies)}
      <li>
        <PostItem data={post} />
      </li>
    {/if}
  {/each}
</ol>
