<script lang="ts">
	import { untrack } from "svelte";
  import FeedTimeline from "./FeedTimeline.svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

  // default feed is discover
  let {
		feedUri = $bindable<string>(
			"at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot"
		)
	} = $props();

  const feedQuery = createInfiniteQuery({
    queryKey: ["feedQuery", feedUri],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      if (pageParam) { queryParams.set("cursor", pageParam); }

      if (feedUri === "following") {
        const response = await fetch(`/api/getFollowingFeed?${queryParams.toString()}`);
        const results = await response.json() as { feed: FeedViewPost[], nextCursor: string };
        return results;
      }

      queryParams.set(
        "feed",
        feedUri
      );

      const response = await fetch(`/api/getCustomFeed?${queryParams.toString()}`);
      const results = await response.json() as { feed: FeedViewPost[], nextCursor: string };
      return results;
    },
    initialPageParam: "",

    // @ts-ignore
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  let feed = $derived.by(() => {
    return $feedQuery.data?.pages.flatMap(page => page.feed) ?? []
  });

  $effect(() => {
    if (feedUri) {
      untrack(() => $feedQuery.refetch());
    }
  })

  $inspect($feedQuery);

  let loadButton = $state<HTMLButtonElement>();
  let observer = $state<IntersectionObserver>();

  $effect(() => {
    if (window && window.IntersectionObserver) {
      observer = new IntersectionObserver((entries) => {
        entries.map((entry) => {
          if (entry.isIntersecting || $feedQuery.isLoading) {
            $feedQuery.fetchNextPage();
          }
        });
      });
    }
  });

  $effect(() => {
    if (loadButton && observer) {
      observer.observe(loadButton);
    }
  });
</script>

<section class="flex flex-col gap-4 items-center w-full h-screen overflow-scroll max-w-2xl self-center">
  {#if $feedQuery.isLoading || $feedQuery.isRefetching}
    <p>Loading...</p>
  {:else if $feedQuery.isError}
    <p>Error</p>
  {:else if $feedQuery.isSuccess}
    <FeedTimeline {feed}>
			<button
				bind:this={loadButton}
				onclick={() => {
					$feedQuery.fetchNextPage();
				}}
				disabled={$feedQuery.isFetchingNextPage}
				class="px-4 py-2 border rounded-sm"
			>
				{#if $feedQuery.isFetchingNextPage}
					Loading...
				{:else}
					Load more...
				{/if}
			</button>
    </FeedTimeline>
  {/if}
</section>
