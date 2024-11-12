<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import { toastError } from "$lib/utils";

  import type { ActionData } from '../../routes/$types';
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
    import PostItem from './PostItem.svelte';

  type Props = {
    form: ActionData | undefined;
    stringifiedFeed: string;
  }

  type FeedPost = FeedViewPost & { html: string };
  
  let { form, stringifiedFeed }: Props = $props();
  let feed = JSON.parse(stringifiedFeed) as FeedPost[];

  let showReposts = $state(true);
  let showReplies = $state(true);

  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  setBottomControls(postToggles);

  if (form && !form.success) { 
    toastError("Action failed"); 
  }
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
  {#each feed as post}
    {#if !(post.reason && !showReposts) && !(post.reply && !showReplies)}
      <li>
        <PostItem data={post} />
      </li>
    {/if}
  {/each}
</ol>
