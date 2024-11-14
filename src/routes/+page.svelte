<script lang="ts">
  import { getContext, onDestroy, type Snippet } from "svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";

  let { data } = $props();
  let user = data.user;

  // TODO: implement feeds in user database
  let feeds = ["following", "discovery"];
  let feedCategory = $state(user ? "following" : "discovery");
  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  let deleteBottomControl = getContext("deleteBottomControl") as (snippet: Snippet) => void;
  setBottomControls(feedSelector);

  onDestroy(() => deleteBottomControl(feedSelector));

  const discoveryQuery = createInfiniteQuery({
    queryKey: ["discoveryFeed"],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set(
        "feed", 
        "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot"
      );

      const response = await fetch(`/api/getCustomFeed?${queryParams.toString()}`);
      const results = await response.json() as { feed: FeedViewPost[], nextCursor: string };
      return results;
    },
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor
  });

  const followingQuery = createInfiniteQuery({
    queryKey: ["followingFeed"],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      queryParams.set("cursor", pageParam || "");
      const response = await fetch(`/api/getFollowingFeed?${queryParams.toString()}`);
      const results = await response.json() as { feed: FeedViewPost[], nextCursor: string }; 
      return results; 
    },
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor
  });

  let discoveryFeed = $derived.by(() => {
    return $discoveryQuery.data?.pages.flatMap(page => page.feed) ?? []
  });

  let followingFeed = $derived.by(() => {
    return $followingQuery.data?.pages.flatMap(page => page.feed) ?? []
  });
</script>

{#snippet feedSelector()}
  <select bind:value={feedCategory} class="bg-transparent">
    {#each feeds as feed}
      <option value={feed} class="capitalize">{feed}</option> 
    {/each}
  </select>
{/snippet}

<div class="flex flex-col gap-4 mx-auto w-full max-w-xl">

  {#if feedCategory === "discovery"}
    <section class="flex flex-col gap-4 items-center">
      {#if $discoveryQuery.isLoading}
        <p>Loading...</p>
      {:else if $discoveryQuery.isError}
        <p>Error</p>
      {:else if $discoveryQuery.isSuccess}
        <FeedTimeline feed={discoveryFeed} />
        <button 
          onclick={() => { 
            $discoveryQuery.fetchNextPage(); 
          }}
          class="px-4 py-2 border rounded"
        >
          Load more...
        </button>
      {/if}
    </section>
  {/if}

  {#if feedCategory === "following"}
    <section class="flex flex-col gap-4 items-center">
      {#if $followingQuery.isLoading}
        <p>Loading...</p>
      {:else if !user}
        <p>Need to be logged in to see Following tab</p>
      {:else if $followingQuery.isError}
        <p>Error</p>
      {:else if $followingQuery.isSuccess}
        <FeedTimeline feed={followingFeed} />
        <button 
          onclick={() => { 
            $followingQuery.fetchNextPage(); 
          }}
          class="px-4 py-2 border rounded"
        >
          Load more...
        </button>
      {/if}
    </section>
  {/if}
</div>
