<script lang="ts">
  import Icon from '@iconify/svelte';
  import { enhance } from '$app/forms';
  import { toastComingSoon, toastError } from "$lib/utils";

  import type { ActionData } from '../../routes/$types';
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
    import { getContext, type Snippet } from 'svelte';

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

{#snippet postDisplay(data: FeedViewPost)}
  <article class={`flex flex-col gap-4 border p-4 ${data.reason && "border-dashed"}`} data-sveltekit-reload>
    <div class="flex items-center justify-between w-full">
      <a href={`/p/${data.post.author.handle}`} class="text-sm hover:underline flex gap-2 items-start">
        <img 
          src={data.post.author.avatar} 
          alt={`${data.post.author.handle} profile picture`} 
          class="size-8 rounded"
        />
        <div class="flex flex-col">
          <p>{data.post.author.displayName}</p>
          <p>@{data.post.author.handle}</p>
        </div>
      </a>
      <div class="flex gap-2">
        {#if data.reason}
          <Icon icon="bx:repost" />
        {/if}
      </div>
    </div>
      
    {#if data.reply}
      <div class="flex gap-2 items-center text-sm font-light">
        <Icon icon="ic:baseline-reply" />
        <a 
          href={`/p/${
            // @ts-ignore
            data.reply.parent.author?.handle ?? "/"
          }`}
        >
          <p class="hover:underline">Reply to
          {
            // @ts-ignore 
            data.reply.parent.author?.handle ?? "unknown"
          }
          </p>
        </a>
      </div>
    {/if}

    <p class="prose prose-invert prose-p:text-white prose-sm prose-pink">
      {@html 
        // @ts-ignore
        data.html 
      }
    </p>

    <menu class="grid grid-cols-4 justify-items-end">
      <button onclick={toastComingSoon} class="flex gap-1 justify-self-start">
        <Icon icon="ph:wrench" class="size-6" />
      </button>
      <button onclick={toastComingSoon} class="flex gap-1">
        <Icon icon="iconamoon:comment" class="size-6" />
        {data.post.replyCount}
      </button>
      <button onclick={toastComingSoon} class="flex gap-1">
        <Icon icon="bx:repost" class="size-6" />
        {data.post.quoteCount}
      </button>
      <form use:enhance action="/?/likePost" method="POST">
        <input name="post_uri" type="hidden" value={data.post.uri} />
        <input name="post_cid" type="hidden" value={data.post.cid} />
        <button type="submit" class="flex gap-1">
          <Icon icon="prime:heart" class="size-6" />
          {data.post.likeCount}
        </button>
      </form>
    </menu>
  </article>
{/snippet}

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
      <li>{@render postDisplay(post)}</li>
    {/if}
  {/each}
</ol>
