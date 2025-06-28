<script lang="ts">
	import { DISCOVERY_FEED_ITEM, FOLLOWING_FEED_ITEM } from "$lib/utils";
	import { feedReaders, isMobile } from "$lib/stores.svelte";
  import FeedReader from "$lib/components/FeedReader.svelte";
	import { Button } from "bits-ui";

  let { data } = $props();
	let user = data.user;
  let pinnedFeeds = data.pinnedFeeds;

	let feeds = [
		...pinnedFeeds,
		DISCOVERY_FEED_ITEM,
		...(user ? [FOLLOWING_FEED_ITEM] : [])
	];

	function addFeedReader() {
		feedReaders.value.push(DISCOVERY_FEED_ITEM);
		feedReaders.update();
	}
</script>

{#if user}
	<div class="flex gap-4 w-full overflow-visible">
		{#if isMobile()}
			<FeedReader index={0} initialFeed={feedReaders.value[0]} {feeds} />
		{:else}
			{#each feedReaders.value as feed, i (`feedReader_${i}`)}
				<FeedReader index={i} initialFeed={feed} {feeds} />
			{/each}
			<Button.Root onclick={addFeedReader} class="self-center">
				Add Feed Reader
			</Button.Root>
		{/if}
	</div>
{:else}
	<FeedReader initialFeed={DISCOVERY_FEED_ITEM} {feeds} />
{/if}
