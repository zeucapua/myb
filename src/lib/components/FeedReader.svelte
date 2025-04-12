<script lang="ts">
	import { untrack } from "svelte";
	import Icon from "@iconify/svelte";
  import FeedTimeline from "./FeedTimeline.svelte";
	import { DISCOVERY_FEED_ITEM } from "$lib/utils";
	import { AlertDialog, Select, Toggle } from "bits-ui";
	import { feedReaders, isMobile } from "$lib/stores.svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

	type FeedItem = { value: string, label: string };

	let { index, initialFeed, feeds }: { index?: number, initialFeed?: FeedItem, feeds: FeedItem[] }  = $props();
	let selectedFeed = $state(initialFeed?.value ?? DISCOVERY_FEED_ITEM.value);
	let selectedFeedLabel = $derived(feeds.find((f) => f.value === selectedFeed)?.label);

	let showReplies = $state(true);
	let showReposts = $state(true);
	let isDeleteDialogOpen = $state(false);

	function deleteFeedReader() {
		console.log("delete");
		feedReaders.value = feedReaders.value.slice(index ?? 0, (index ?? 0) +1);
		feedReaders.update();
		isDeleteDialogOpen = false;
	}

  const feedQuery = $derived(createInfiniteQuery({
    queryKey: ["feedQuery", selectedFeed],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      if (pageParam) { queryParams.set("cursor", pageParam); }

      if (selectedFeed === "following") {
        const response = await fetch(`/api/getFollowingFeed?${queryParams.toString()}`);
        const results = await response.json() as { feed: FeedViewPost[], nextCursor: string };
        return results;
      }

      queryParams.set(
        "feed",
				selectedFeed
      );

      const response = await fetch(`/api/getCustomFeed?${queryParams.toString()}`);
      const results = await response.json() as { feed: FeedViewPost[], nextCursor: string };
      return results;
    },
    initialPageParam: "",

    // @ts-ignore
    getNextPageParam: (lastPage) => lastPage.nextCursor
  }));

  let feed = $derived.by(() => {
    return $feedQuery.data?.pages.flatMap(page => page.feed) ?? []
  });

  $effect(() => {
    if (selectedFeed) {
      untrack(() => $feedQuery.refetch());
			untrack(() => {
				if (index) {
					feedReaders.value[index] = { value: selectedFeed, label: selectedFeedLabel ?? "" };
					feedReaders.update();
				}
			});
    }
  })

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

	$inspect({ selectedFeed, index, feedReaders });
</script>

<section class={[isMobile() && "max-h-[90%]", "relative flex flex-col gap-4 items-center w-full h-screen overflow-y-scroll overflow-x-clip md:min-w-xl self-center"]}>
	<menu class="sticky top-0 w-full flex gap-4 justify-between bg-slate-800 px-4 py-2 z-50">
		<Select.Root type="single" bind:value={selectedFeed} items={feeds}>
			<Select.Trigger>
				<p class="px-4 py-2 w-full max-w-xl border rounded overflow-ellipsis">{selectedFeedLabel}</p>
			</Select.Trigger>
			<Select.Portal>
				<Select.Content side="right" sideOffset={8} class="z-50">
					<Select.Viewport class="flex flex-col gap-4">
						{#each feeds as feed}
							<Select.Item value={feed.value} label={feed.label}>
								{#if selectedFeed === feed.value}
									<Icon icon="ic:round-check" />
								{/if}
								<p>{feed.label}</p>
							</Select.Item>
						{/each}
					</Select.Viewport>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
		<div class="flex gap-4">
			<Toggle.Root bind:pressed={showReplies} class="data-[state=on]:bg-white/10 p-2 rounded cursor-pointer">
				<Icon icon="iconamoon:comment" class="size-6" />
			</Toggle.Root>
			<Toggle.Root bind:pressed={showReposts} class="data-[state=on]:bg-white/10 p-2 rounded cursor-pointer">
				<Icon icon="bx:repost" class="size-6" />
			</Toggle.Root>
			{#if !isMobile() && feedReaders.value.length > 1}
				<AlertDialog.Root bind:open={isDeleteDialogOpen}>
					<AlertDialog.Trigger>
						<Icon icon="ph:trash" class="size-6" color="red" />
					</AlertDialog.Trigger>
					<AlertDialog.Portal>
						<AlertDialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
						<AlertDialog.Content class="text-white rounded-lg absolute z-50 left-[50%] translate-x-[-50%] translate-y-[-50%] bg-slate-800 top-[50%] w-full h-fit p-8 max-w-xl flex flex-col gap-4">
							<AlertDialog.Title class="text-xl font-bold">
								Confirm reader deletion
							</AlertDialog.Title>
							<AlertDialog.Description>
								This will not delete the feed from your saved feeds preferences,
								just removing this reader from your home page.
							</AlertDialog.Description>
							<div class="flex gap-4">
								<AlertDialog.Cancel class="w-full py-2 rounded cursor-pointer bg-white hover:bg-gray-200 text-black text-center">
									Cancel
								</AlertDialog.Cancel>
								<AlertDialog.Action
									onclick={() => deleteFeedReader()}
									class="w-full py-2 rounded cursor-pointer bg-red-500 hover:bg-red-600 text-center"
								>
									Delete
								</AlertDialog.Action>
							</div>
						</AlertDialog.Content>
					</AlertDialog.Portal>
				</AlertDialog.Root>
			{/if}
		</div>
	</menu>
  {#if $feedQuery.isLoading || $feedQuery.isRefetching}
    <p>Loading...</p>
  {:else if $feedQuery.isError}
    <p>Error</p>
  {:else if $feedQuery.isSuccess}
    <FeedTimeline {feed} bind:showReplies bind:showReposts>
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
