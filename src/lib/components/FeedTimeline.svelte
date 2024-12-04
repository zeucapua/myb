<script lang="ts">
  import { Toggle } from 'bits-ui';
  import Icon from '@iconify/svelte';
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
    <Toggle.Root 
      bind:pressed={showReplies}
      class="inline-flex size-10 items-center justify-center rounded-[9px] transition-all hover:bg-white/5 active:scale-95 active:bg-dark-10 data-[state=on]:bg-white/5 data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10"
    >
      <Icon icon="ri:reply-fill" />
    </Toggle.Root>
    <Toggle.Root 
      bind:pressed={showReposts}
      class="inline-flex size-10 items-center justify-center rounded-[9px] transition-all hover:bg-white/5 active:scale-95 active:bg-dark-10 data-[state=on]:bg-white/5 data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10"
    >
      <Icon icon="bx:repost" />
    </Toggle.Root>
  </menu>
{/snippet}


<ol class="flex flex-col divide-y divide-slate-700">
  {#each feed as post: FeedPost}
    {#if !(post.reason && !showReposts) && !(post.reply && !showReplies)}
      <li>
        <PostItem data={post} />
      </li>
    {/if}
  {/each}
</ol>
