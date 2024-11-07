<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

  type Props = {
    stringifiedFeed: string;
  }

  type FeedPost = FeedViewPost & { html: string };
  
  let { stringifiedFeed }: Props = $props();
  let feed = JSON.parse(stringifiedFeed) as FeedPost[];

  let showReposts = $state(true);
  let showReplies = $state(true);
</script>

{#snippet postDisplay(data: FeedViewPost)}
  <article class={`flex flex-col gap-4 border p-4 rounded ${data.reason && "border-dashed"}`} data-sveltekit-reload>
    <div class="flex items-center justify-between w-full">
      <a href={`/p/${data.post.author.handle}`} class="hover:underline flex gap-2 items-center">
        <img 
          src={data.post.author.avatar} 
          alt={`${data.post.author.handle} profile picture`} 
          class="size-6 rounded"
        />
        @{data.post.author.handle} 
      </a>
      <div class="flex gap-2">
        {#if data.reason}
          <Icon icon="bx:repost" />
        {/if}
      </div>
    </div>
      
    {#if data.reply}
      <div class="flex gap-2 items-center text-sm font-light">
        <Icon icon="ic:baseline-reply" />
        <a 
          href={`/p/${
            // @ts-ignore
            data.reply.parent.author?.handle ?? "/"
          }`}
        >
          <p class="hover:underline">Reply to
          {
            // @ts-ignore 
            data.reply.parent.author?.handle ?? "unknown"
          }
          </p>
        </a>
      </div>
    {/if}

    <p class="prose prose-invert">
      {@html 
        // @ts-ignore
        data.html 
      }
    </p>

    <menu class="flex justify-between">
      <div class="flex gap-2">
        <button class="flex gap-1">
          <Icon icon="ph:wrench" class="size-6" />
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button class="flex gap-1">
          <Icon icon="iconamoon:comment" class="size-6" />
          {data.post.replyCount}
        </button>
        <button class="flex gap-1">
          <Icon icon="bx:repost" class="size-6" />
          {data.post.quoteCount}
        </button>
        <button class="flex gap-1">
          <Icon icon="prime:heart" class="size-6" />
          {data.post.likeCount}
        </button>
      </div>
    </menu>
  </article>
{/snippet}

<menu class="flex gap-4">
  <label class="flex gap-2">
    <input type="checkbox" bind:checked={showReposts} />
    Reposts
  </label>
  <label class="flex gap-2">
    <input type="checkbox" bind:checked={showReplies} />
    Replies
  </label>
</menu>


<ol class="flex flex-col gap-4">
  {#each feed as post}
    {#if !(post.reason && !showReposts) && !(post.reply && !showReplies)}
      <li>{@render postDisplay(post)}</li>
    {/if}
  {/each}
</ol>
