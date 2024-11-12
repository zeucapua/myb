<script lang="ts">
  import Icon from "@iconify/svelte";
  import { enhance } from "$app/forms";
  import { toastComingSoon } from "$lib/utils";
  import { formatDistanceToNowStrict } from "date-fns";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
    import { type ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record";

  let { data }: { data: FeedViewPost } = $props();
  console.log(data.post.embed?.record);
</script>

{#snippet quotedPost(record: ViewRecord)}
  <article class="flex flex-col gap-2 border px-4 py-2 rounded">
    <a href={`/p/${record.author.handle}`} class="text-sm hover:underline flex gap-2 items-start">
      <img 
        src={record.author.avatar} 
        alt={`${record.author.handle} profile picture`} 
        class="size-8 rounded"
      />
      <div class="flex flex-col">
        <p class="flex gap-1 items-center">
          {record.author.displayName} 
          <span class="text-xs">@{record.author.handle}</span>
        </p>
        <time class="text-xs font-light">
          {formatDistanceToNowStrict(new Date(record.indexedAt))} ago
        </time>
      </div>
    </a>

    <p class="text-sm text-white prose prose-invert prose-p:text-white prose-sm prose-pink">
      {@html
        // @ts-ignore
        record.value.text
      }
    </p>
  </article>
{/snippet}

<article class={`flex flex-col gap-4 border p-4 hover:bg-white/[0.025] transition-all duration-150 ${data.reason && "border-dashed"}`} data-sveltekit-reload>
  <div class="flex items-center justify-between w-full">
    <a href={`/p/${data.post.author.handle}`} class="text-sm hover:underline flex gap-2 items-start">
      <img 
        src={data.post.author.avatar} 
        alt={`${data.post.author.handle} profile picture`} 
        class="size-8 rounded"
      />
      <div class="flex flex-col">
        <p class="flex gap-1 items-center">
          {data.post.author.displayName} 
          <span class="text-xs">@{data.post.author.handle}</span>
        </p>
        <time class="text-xs font-light">
          {formatDistanceToNowStrict(new Date(data.post.indexedAt))} ago
        </time>
      </div>
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

  <p class="text-sm prose prose-invert prose-p:text-white prose-sm prose-pink">
    {@html 
      // @ts-ignore
      data.html 
    }
  </p>
  
  {#if data.post.embed}
    {#if data.post.embed.$type === "app.bsky.embed.images#view"}
      {#each (data.post.embed.images as {fullsize: string, alt: string}[]) as image}
        <img src={image.fullsize} alt={image.alt} />
      {/each}
    {:else if data.post.embed.$type === "app.bsky.embed.external#view"}
      <img src={data.post.embed.external!.uri} alt={data.post.embed.external!.description} />
    {:else if data.post.embed.$type === "app.bsky.embed.record#view"}
      {@render quotedPost(data.post.embed.record as ViewRecord)}
    {/if}
  {/if}

  <menu class="grid grid-cols-4 justify-items-end">
    <button onclick={toastComingSoon} class="flex gap-1 justify-self-start">
      <Icon icon="ph:wrench" class="size-6" />
    </button>
    <button onclick={toastComingSoon} class="flex gap-1">
      <Icon icon="iconamoon:comment" class="size-6" />
      {data.post.replyCount}
    </button>
    <button onclick={toastComingSoon} class="flex gap-1">
      <Icon icon="bx:repost" class="size-6" />
      {data.post.quoteCount}
    </button>
    <form use:enhance action="/?/likePost" method="POST">
      <input name="post_uri" type="hidden" value={data.post.uri} />
      <input name="post_cid" type="hidden" value={data.post.cid} />
      <button type="submit" class="flex gap-1">
        <Icon icon="prime:heart" class="size-6" />
        {data.post.likeCount}
      </button>
    </form>
  </menu>
</article>
