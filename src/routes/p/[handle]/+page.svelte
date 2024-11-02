<script lang="ts">
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
  
  type Props = {
    data: {
      result: ProfileViewDetailed;
      feed: string
    }
  };

  let { data }: Props = $props();
  const feed = JSON.parse(data.feed) as FeedViewPost[];
</script>

{#snippet postDisplay(data: FeedViewPost)}
  <article class="flex flex-col gap-4 border px-4 py-2 rounded">
    <h1>{data.post.author.handle}</h1>
    <p>
    {
      // @ts-ignore
      data.post.record.text
    }
    </p>
  </article>
{/snippet}

<img src={data.result.avatar} alt={`${data.result.handle} profile picture`} class="size-16" />
<p>{data.result.handle}</p>

{#each feed as post}
  {@render postDisplay(post)}
{/each}
