<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
    import PostItem from "$lib/components/PostItem.svelte";
  let { data }: { data: { profile: ProfileViewDetailed }} = $props();

  const recordsQuery = createQuery({
    queryKey: ["recordsQuery"],
    queryFn: async () => {
      const response = await fetch(`/api/getProfileStats?handle=${data.profile.handle}`);
      const { records, likes, replies, reposts, quotes } = await response.json();
      return { records, likes, replies, reposts, quotes };
    }
  });

  $inspect($recordsQuery);
</script>

{#if $recordsQuery.isPending}
  <p>Loading...</p> 
{:else if $recordsQuery.isSuccess}
  <section>
    <h2>Top Skeets</h2>
    {#each ($recordsQuery.data.records.splice(0,5) || [] as FeedViewPost[]) as record}
      <PostItem data={record} />
    {/each}
  </section>
{:else} 
  <p>Something went wrong...</p>
{/if}



