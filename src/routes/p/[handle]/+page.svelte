<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
  
  type Props = {
    data: {
      profile: ProfileViewDetailed;
      feed: string
    }
  };

  let { data }: Props = $props();
  const feed = JSON.parse(data.feed) as FeedViewPost & { html: string }[];

  let showReposts = $state(true);
</script>

{#snippet postDisplay(data: FeedViewPost)}
  <article class={`flex flex-col gap-4 border px-4 py-2 rounded ${data.reason && "border-dashed"}`}>
    <div class="flex items-center justify-between w-full">
      <h1>{data.post.author.handle} </h1>
      <div class="flex gap-2">
        {#if data.reason}
          <Icon icon="bx:repost" />
        {/if}
        {#if data.reply}
          <Icon icon="ic:baseline-reply" />
        {/if}
      </div>
    </div>
    <p class="prose prose-invert">
      {@html 
        // @ts-ignore
        data.html 
      }
    </p>
  </article>
{/snippet}

<section class="flex gap-4 items-center">
  <img src={data.profile.avatar} alt={`${data.profile.handle} profile picture`} class="size-16 rounded" />
  <div class="flex flex-col">
    <h1 class="text-lg font-bold">{data.profile.displayName}</h1>
    <h2 class="font-medium">@{data.profile.handle}</h2>
    <div class="flex gap-4 font-thin">
      <p>{data.profile.followersCount} Followers</p>
      <p>{data.profile.followsCount} Following</p>
    </div>
  </div>
</section>

<menu class="flex gap-4">
  <label class="flex gap-2">
    <input type="checkbox" bind:checked={showReposts} />
    Reposts
  </label>
</menu>


<ol class="flex flex-col gap-4">
  {#each feed as post}
    {#if !(post.reason && !showReposts)}
      <li>{@render postDisplay(post)}</li>
    {/if}
  {/each}
</ol>
