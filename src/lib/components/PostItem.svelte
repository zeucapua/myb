<script lang="ts">
  import { Tooltip } from "bits-ui";
  import Icon from "@iconify/svelte";
  import { page } from "$app/stores";
  import { applyAction, enhance } from "$app/forms";
  import { fade } from "svelte/transition";
  import { formatDistanceToNowStrict } from "date-fns";
  import { toastComingSoon, toastError } from "$lib/utils";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
    import PostEmbed from "./PostEmbed.svelte";

  let { data }: { data: FeedViewPost } = $props();
  const user = $page.data.user;
  const bookmarks = $page.data.bookmarks as Set<string>; 
  let isBookmarked = $state(bookmarks.has(data.post.uri) ?? false);
</script>

<article class={`flex flex-col gap-4 border p-4 hover:bg-white/[0.025] transition-all duration-150 ${data.reason && "border-dashed"}`} data-sveltekit-reload>
  <div class="flex items-center justify-between w-full">
    <a href={`/p/${data.post.author.handle}`} class="text-sm hover:underline flex gap-2 items-center">
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

    <div class="flex gap-2 items-center">
      {#if data.reason}
        <Icon icon="bx:repost" />
        <Tooltip.Root>
          <Tooltip.Trigger>
            <a href={`/p/${data.reason.by!.handle || "unknown"}`}>
              <img 
                src={data.reason.by!.avatar} 
                alt={`${data.reason.by!.handle || "unknown"} profile picture`} 
                class="size-8 rounded"
              />
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content
            transition={fade}
            transitionConfig={{ duration: 150 }}
            sideOffset={8}
            side="bottom"
          >
            <div class="bg-white">
              <Tooltip.Arrow class="rounded-[2px] border-l border-t border-dark-10" />
            </div>
            <div
              class="rounded flex flex-col justify-center rounded-input border border-dark-10 bg-white px-2 py-1 text-xs font-medium shadow-popover outline-none"
            >
              <p class="text-xs font-bold">{data.reason.by!.displayName || "unknown"}</p>
              <p class="text-xs">@{data.reason.by!.handle || "unknown"}</p>
            </div>
          </Tooltip.Content>
        </Tooltip.Root>
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
    <PostEmbed embed={data.post.embed} />
  {/if}

  <menu class="grid grid-cols-4 justify-items-end">
    <div class="flex gap-2 justify-self-start">
      <button onclick={toastComingSoon} class="flex gap-1 justify-self-start">
        <Icon icon="ph:wrench" class="size-6" />
      </button>
      {#if !user}
        <button onclick={() => toastError("Log in to bookmark")} class="flex gap-1 justify-self-start">
          <Icon 
            icon={isBookmarked ? "mingcute:bookmark-fill" : "mingcute:bookmark-line"}
            class="size-6" 
          />
        </button>
      {:else}
        <form
          method="POST" 
          action="/?/bookmarkPost"
          use:enhance={() => {
            return async ({ result }) => {
              // @ts-ignore
              if (result.data.uri === data.post.uri) {
                // @ts-ignore
                isBookmarked = result.data.message === "bookmarked";
              }
              await applyAction(result);
            }
          }} 
        >
          <input name="post_uri" type="hidden" value={data.post.uri} />
          <input name="is_bookmarked" type="hidden" value={isBookmarked} />
          <button type="submit" class="flex gap-1 justify-self-start">
            <Icon 
              icon={isBookmarked ? "mingcute:bookmark-fill" : "mingcute:bookmark-line"}
              class="size-6" 
            />
          </button>
        </form>
      {/if}
    </div>
    <button onclick={toastComingSoon} class="flex gap-1">
      <Icon icon="iconamoon:comment" class="size-6" />
      {data.post.replyCount}
    </button>
    <button onclick={toastComingSoon} class="flex gap-1">
      <Icon icon="bx:repost" class="size-6" />
      {data.post.quoteCount}
    </button>
    <button type="submit" class="flex gap-1">
      <Icon icon="prime:heart" class="size-6" />
      {data.post.likeCount}
    </button>
  </menu>
</article>
