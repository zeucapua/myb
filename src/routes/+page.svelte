<script lang="ts">
  import FeedReader from "$lib/components/FeedReader.svelte";

  let { data } = $props();
  let user = data.user;
  let pinnedFeeds = data.pinnedFeeds;

	let feeds = [
		...pinnedFeeds,
		{ value: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot", label: "Discovery" },
	];
</script>

<div class="h-screen">
  <FeedReader {feeds} />
</div>
