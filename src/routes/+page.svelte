<script lang="ts">
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";

  let { data } = $props();
</script>

<FeedTimeline stringifiedFeed={data.feed as string} />
