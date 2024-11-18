<script lang="ts">
  import { Select } from "bits-ui";
  import { getContext, onDestroy, type Snippet } from "svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
    import Icon from "@iconify/svelte";
    import { fly } from "svelte/transition";

  let { data } = $props();
  let user = data.user;

  // TODO: implement feeds in user database
  let feeds = [
    { value: "following", label: "Following" },
    { value: "discovery", label: "Discovery" },
  ];
  let selectedFeed = $state(user ? 
    { value: "following", label: "Following" } 
    : { value: "discovery", label: "Discovery" }
  );
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

  $inspect(selectedFeed);
</script>

{#snippet feedSelector()}
  <Select.Root items={feeds} bind:selected={selectedFeed}>
    <Select.Trigger
      class="inline-flex h-input py-2 w-48 justify-between items-center rounded-lg border border-border-input bg-background px-[11px] text-sm transition-colors placeholder:text-foreground-alt/50  focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Select a feed"
    >
      <Select.Value class="text-sm" placeholder="Select a feed" />
      <Icon icon="uil:angle-down" />
    </Select.Trigger>
    <Select.Content
      class="z-50 w-full rounded-xl border border-white bg-white px-1 py-3 shadow-popover outline-none"
      transition={fly}
      sideOffset={8}
    >
      {#each feeds as feed}
        <Select.Item
          class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-neutral-200 rounded-lg"
          value={feed.value}
          label={feed.label}
        >
          {feed.label}
          <Select.ItemIndicator class="ml-auto" asChild={false}>
            <Icon icon="uil:check" />
          </Select.ItemIndicator>
        </Select.Item>
      {/each}
    </Select.Content>
    <Select.Input name="favoriteFruit" />
  </Select.Root>
{/snippet}

<div class="flex flex-col gap-4 mx-auto w-full max-w-xl">

  {#if selectedFeed.value === "discovery"}
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

  {#if selectedFeed.value === "following"}
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
