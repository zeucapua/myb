<script lang="ts">
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data }: { data: { profile: ProfileViewDetailed } }= $props();
  const authorFeedQuery = createInfiniteQuery({
    queryKey: ["authorFeed"],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      queryParams.set("actor", data.profile.did); 
      queryParams.set("cursor", pageParam || "");
      const response = await fetch(`/api/getAuthorFeed?${queryParams.toString()}`);
      const results = await response.json() as { feed: FeedViewPost[], nextCursor: string }; 
      return results; 
    },
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor
  });

  let authorFeed = $derived.by(() => {
    return $authorFeedQuery.data?.pages.flatMap(page => page.feed) as FeedViewPost[] ?? []
  });
</script>

<section class="flex flex-col gap-4 items-center w-full">
  {#if $authorFeedQuery.isLoading}
    <p>Loading...</p>
  {:else if $authorFeedQuery.isError}
    <p>Error</p>
  {:else if $authorFeedQuery.isSuccess}
    <FeedTimeline feed={authorFeed} />
    <button 
      onclick={() => { 
        $authorFeedQuery.fetchNextPage(); 
      }}
      class="px-4 py-2 border rounded-sm"
    >
      Load more...
    </button>
  {/if}
</section>
