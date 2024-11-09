<script lang="ts">
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";

  let { data, form } = $props();
</script>

<FeedTimeline {form} stringifiedFeed={data.feed as string} />
