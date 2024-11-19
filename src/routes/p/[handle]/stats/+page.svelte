<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Collapsible } from "bits-ui";
  import { slide } from "svelte/transition";
  import { createQuery } from "@tanstack/svelte-query";
  import PostItem from "$lib/components/PostItem.svelte";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data }: { data: { profile: ProfileViewDetailed }} = $props();

  const recordsQuery = createQuery({
    queryKey: ["recordsQuery"],
    queryFn: async () => {
      const response = await fetch(`/api/getProfileStats?handle=${data.profile.handle}`);
      const { records, likes, replies, reposts, quotes } = await response.json();
      return { records, likes, replies, reposts, quotes };
    }
  });

  const topSkeets = $derived.by(() => {
    return $recordsQuery?.data?.records.splice(0,5) || [] as FeedViewPost[]
  });

  const topSkeetsStats = $derived.by(() => {
    const avgLikes = topSkeets.reduce((previous: number, current: FeedViewPost) => {
      return previous + (current.post.likeCount || 0)
    }, 0) / 5;
    const avgReplies = topSkeets.reduce((previous: number, current: FeedViewPost) => {
      return previous + (current.post.replyCount || 0)
    }, 0) / 5;
    const avgReposts = topSkeets.reduce((previous: number, current: FeedViewPost) => {
      return previous + (current.post.repostCount || 0)
    }, 0) / 5;
    const avgQuotes = topSkeets.reduce((previous: number, current: FeedViewPost) => {
      return previous + (current.post.quoteCount || 0)
    }, 0) / 5;

    return { avgLikes, avgReplies, avgReposts, avgQuotes };
  });

  $inspect($recordsQuery);
</script>

{#snippet dataBlock(title: string, value: any, icon?: string, subtitle?: any)}
  <div class="flex flex-col justify-between border p-4 rounded">
    <h3 class="text-sm font-medium flex items-center gap-2">
      {#if icon}
        <Icon {icon} />
      {/if}
      {title}
    </h3>
    <p class="text-4xl font-black">{value}</p>
  </div>
{/snippet}

{#if $recordsQuery.isPending}
  <p>Loading...</p> 
{:else if $recordsQuery.isSuccess}
  <section class="flex flex-col gap-4"> 
    <h1 class="text-xl font-bold">7 Days</h1> 
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-stretch">
      {@render dataBlock("Likes", $recordsQuery.data.likes, "solar:heart-bold")}
      {@render dataBlock("Replies", $recordsQuery.data.replies, "ri:reply-fill")}
      {@render dataBlock("Reposts", $recordsQuery.data.reposts, "bx:repost")}
      {@render dataBlock("Quotes", $recordsQuery.data.quotes, "tabler:quote-filled")}
    </section>
  </section>

  <section class="flex flex-col gap-4"> 
    <h1 class="text-xl font-bold">Top 7 Day Skeets (Avg.)</h1> 
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-stretch">
      {@render dataBlock("Likes", topSkeetsStats.avgLikes, "solar:heart-bold")}
      {@render dataBlock("Replies", topSkeetsStats.avgReplies, "ri:reply-fill")}
      {@render dataBlock("Reposts", topSkeetsStats.avgReposts, "bx:repost")}
      {@render dataBlock("Quotes", topSkeetsStats.avgQuotes, "tabler:quote-filled")}
    </section>
    <Collapsible.Root class="flex flex-col gap-4">
      <Collapsible.Trigger>
        <div class="flex justify-between gap-4 border px-4 py-2 rounded items-center">
          <h2 class="font-bold">Top Skeets</h2>
          <Icon icon="mingcute:down-fill" />
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content class="flex flex-col" transition={slide}>
        {#each topSkeets as record}
          <PostItem data={record} />
        {/each}
      </Collapsible.Content>
    </Collapsible.Root>
  </section>
{:else} 
  <p>Something went wrong...</p>
{/if}



