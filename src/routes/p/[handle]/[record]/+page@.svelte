<script lang="ts">
  import { formatDistanceToNowStrict } from 'date-fns';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs.js';
  import { createQuery } from '@tanstack/svelte-query';
  import type { FeedViewPost, isFeedViewPost, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
  import PostItem from '$lib/components/PostItem.svelte';
  import PostEmbed from '$lib/components/PostEmbed.svelte';
  import { toastComingSoon, toastError } from '$lib/utils';
  import Icon from '@iconify/svelte';
  import { applyAction, enhance } from '$app/forms';
  import { page } from '$app/stores';
    import FeedTimeline from '$lib/components/FeedTimeline.svelte';
    import Avatar from 'svelte-boring-avatars';

  type Props = {
    data: {
      recordUri: string;
      author: ProfileViewDetailed
    }
  }
  let { data }: Props = $props();
  let author = data.author;
  const user = $page.data.user;
  const bookmarks = $page.data.bookmarks as Set<string>; 
  let isBookmarked = $state(bookmarks.has(data.recordUri) ?? false);

  const threadQuery = createQuery({
    queryKey: ["threadQuery"],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("uri", data.recordUri); 
      const response = await fetch(`/api/getPostThread?${queryParams.toString()}`);
      const thread = await response.json() as ThreadViewPost;
      return { thread };
    }
  });

  $inspect($threadQuery);
  // @ts-ignore
  $effect(() => console.log($threadQuery.data.thread.parent?.post));
</script>

<div class="flex flex-col gap-8 w-full max-w-xl mx-auto">

{#if $threadQuery.isLoading}
  <p>Loading...</p>
{:else if $threadQuery.isSuccess}
  {#if $threadQuery.data.thread.parent}
    <PostItem data={$threadQuery.data.thread.parent as FeedViewPost} />
  {/if}
  
  <article id="selected_post" class="flex flex-col gap-8 p-4 border">
    <div class="text-sm flex gap-2 items-center">
      <a href={`/p/${author.handle}`}>
        {#if author.avatar}
          <img 
            src={author.avatar} 
            alt={`${author.handle} profile picture`} 
            class="size-8 rounded"
          />
        {:else}
          <Avatar name={author.displayName} variant="bauhaus" />
        {/if}
      </a>
      <div class="flex flex-col">
        <a href={`/p/${author.handle}`}>
          <p class="flex gap-1 items-center">
            {author.displayName} 
            <span class="text-xs">@{author.handle}</span>
          </p>
        </a>
        
        <time class="text-xs font-light">
          {formatDistanceToNowStrict(new Date($threadQuery.data.thread.post.indexedAt))} ago
        </time>
      </div>
    </div>

    <div class="prose prose-invert prose-pink text-white text-lg">
      {@html $threadQuery.data.thread.post.html}
    </div>

    {#if $threadQuery.data.thread.post.embed}
      <PostEmbed embed={$threadQuery.data.thread.post.embed} />
    {/if}

    <menu class="grid grid-cols-4 justify-items-end">
      <div class="flex gap-2 justify-self-start">
        <button onclick={toastComingSoon} class="flex gap-1 justify-self-start">
          <Icon icon="ph:wrench" class="size-6" />
        </button>
        {#if !user}
          <button onclick={() => toastError("Log in to bookmark")} class="flex gap-1 justify-self-start">
            <Icon 
              icon={isBookmarked ? "mingcute:bookmark-fill" : "mingcute:bookmark-line"}
              class="size-6" 
            />
          </button>
        {:else}
          <form
            method="POST" 
            action="/?/bookmarkPost"
            use:enhance={() => {
              return async ({ result }) => {
                // @ts-ignore
                if (result.data.uri === data.post.uri) {
                  // @ts-ignore
                  isBookmarked = result.data.message === "bookmarked";
                }
                await applyAction(result);
              }
            }} 
          >
            <input name="post_uri" type="hidden" value={data.recordUri} />
            <input name="is_bookmarked" type="hidden" value={isBookmarked} />
            <button type="submit" class="flex gap-1 justify-self-start">
              <Icon 
                icon={isBookmarked ? "mingcute:bookmark-fill" : "mingcute:bookmark-line"}
                class="size-6" 
              />
            </button>
          </form>
        {/if}
      </div>
      <button onclick={toastComingSoon} class="flex gap-1">
        <Icon icon="iconamoon:comment" class="size-6" />
        {$threadQuery.data.thread.post.replyCount}
      </button>
      <button onclick={toastComingSoon} class="flex gap-1">
        <Icon icon="bx:repost" class="size-6" />
        {$threadQuery.data.thread.post.repostCount}
      </button>
      <button type="submit" class="flex gap-1">
        <Icon icon="prime:heart" class="size-6" />
        {$threadQuery.data.thread.post.likeCount}
      </button>
    </menu>
  </article>

  {#if $threadQuery.data.thread.replies && $threadQuery.data.thread.replies.length > 0}
    <section class="flex flex-col gap-4 border-t-2 py-4">
      <h2 class="text-lg font-medium">Replies</h2>
      <FeedTimeline feed={$threadQuery.data.thread.replies as FeedViewPost[]} />
    </section>
  {/if}

{:else}
  <p>Error loading (Record URI: {data.recordUri})</p>
{/if}

</div>
