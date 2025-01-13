<script lang="ts">
  import { page } from "$app/state";
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
  import Avatar from "svelte-boring-avatars";
  import PostEmbed from "./PostEmbed.svelte";
  import { Tooltip, DropdownMenu, AlertDialog } from "bits-ui";
  import { applyAction, enhance } from "$app/forms";
  import { formatDistanceToNowStrict } from "date-fns";
  import { toastComingSoon, toastError } from "$lib/utils";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data, isBordered = false }: { data: FeedViewPost, isBordered?: boolean } = $props();
  const user = page.data.user as ProfileViewDetailed;
  const bookmarks = page.data.bookmarks as Set<string>; 
  let isBookmarked = $state(bookmarks.has(data.post.uri) ?? false);

  let likes = $state(data.post.likeCount ?? 0);
  let likeUri = $state(data.post.viewer?.like ?? "");

  let reposts = $state(data.post.repostCount ?? 0);
  let repostUri = $state(data.post.viewer?.repost ?? "");

  const record_id = data.post.uri.split("/").at(data.post.uri.split("/").length - 1);

  let isDeleteDialogOpen = $state(false);
  let isDeleted = $state(false);
</script>

<AlertDialog.Root bind:open={isDeleteDialogOpen}>
  <AlertDialog.Portal>
    <AlertDialog.Overlay 
      transition={fade} 
      transitionConfig={{ duration: 100 }}
      class="fixed inset-0 z-50 bg-black/80" 
    />
    <AlertDialog.Content 
      transition={fade}
      transitionConfig={{ duration: 100 }}
      class="fixed text-white z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-xl w-full max-w-[70%] h-fit p-8 bg-slate-800 shadow-lg"
    >
      <AlertDialog.Title class="text-xl text-white font-bold mb-4">
        Delete this post?
      </AlertDialog.Title>
      <AlertDialog.Description class="text-slate-300">
        If you remove this post, you won't be able to recover it.
      </AlertDialog.Description>

      <menu class="flex gap-4 w-full h-fit mt-8">
        <AlertDialog.Cancel class="basis-1/2 bg-slate-600 px-4 py-2 rounded hover:bg-slate-700 cursor-pointer">
          Cancel
        </AlertDialog.Cancel>
        <form 
          use:enhance={() => {
            return async ({ result }) => {
              // @ts-ignore
              if (result.data.uri === data.post.uri) {
                isDeleted = true;
              }
              await applyAction(result);
            }
          }}
          method="POST" 
          action="/?/deletePost" 
          class="basis-1/2"
        >
          <input name="post_uri" type="hidden" value={data.post.uri} />
          <AlertDialog.Action type="submit" class="w-full bg-red-500 px-4 py-2 rounded hover:bg-red-600 cursor-pointer">
            Delete
          </AlertDialog.Action>
        </form>
      </menu>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>

{#if isDeleted}
  <article class={`flex flex-col gap-4 p-4 hover:bg-white/[0.025] transition-all duration-150 ${isBordered && "border"} ${data.reason && "border-dashed"}`} data-sveltekit-reload>
    <p>This post has been deleted</p>
  </article>
{:else}
  <article class={`flex flex-col gap-4 p-4 hover:bg-white/[0.025] transition-all duration-150 ${isBordered && "border"} ${data.reason && "border-dashed"}`} data-sveltekit-reload>
    <section class="flex items-center justify-between w-full">
      <div class="text-sm flex gap-2 items-center">
        <a href={`/p/${data.post.author.handle}`} >
          {#if data.post.author.avatar}
            <img 
              src={data.post.author.avatar} 
              alt={`${data.post.author.handle} profile picture`} 
              class="size-8 rounded"
            />
          {:else}
            <Avatar name={data.post.author.displayName} variant="bauhaus" />
          {/if}
        </a>
        <div class="flex flex-col hover:underline ">
          <a href={`/p/${data.post.author.handle}`} >
            <p class="flex gap-1 items-center">
              {data.post.author.displayName} 
              <span class="text-xs">@{data.post.author.handle}</span>
            </p>
          </a>
          <time class="text-xs font-light">
            {formatDistanceToNowStrict(new Date(data.post.indexedAt))} ago
          </time>
        </div>
        <a href={`/p/${data.post.author.handle}/${record_id}#selected_post`}>
          <Icon icon="ep:right" />
        </a>
      </div>

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
    </section>
      
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
        {#if !user}
          <button onclick={toastComingSoon} class="flex gap-1 justify-self-start">
            <Icon icon="ph:wrench" class="size-6" />
          </button>
          <button onclick={() => toastError("Log in to bookmark")} class="flex gap-1 justify-self-start">
            <Icon 
              icon={isBookmarked ? "mingcute:bookmark-fill" : "mingcute:bookmark-line"}
              class="size-6" 
            />
          </button>
        {:else}
          <DropdownMenu.Root> 
            <DropdownMenu.Trigger class="flex gap-1 justify-self-start">
              <Icon icon="ph:wrench" class="size-6" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content 
              class="flex flex-col gap-2 bg-slate-800 min-w-12 h-fit p-2 rounded-lg shadow-lg border border-slate-600 text-sm text-white"
            >
              {#if data.post.author.did === user.did}
                <DropdownMenu.Item 
                  onclick={() => isDeleteDialogOpen = true}
                  class="text-red-400 cursor-pointer flex items-center px-2 py-1 gap-2 hover:bg-white/5 transition-all duration-150 rounded"
                >
                  <Icon icon="ph:trash" class="size-4" />
                  <p>Delete post</p> 
                </DropdownMenu.Item>
              {/if}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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

      {#if !user}
        <a href={`/p/${data.post.author.handle}/${record_id}#selected_post`} class="flex gap-1">
          <Icon icon="iconamoon:comment" class="size-6" />
          {data.post.replyCount}
        </a>
        <button onclick={() => toastError("Must be logged in to repost")} class="flex gap-1">
          <Icon icon="bx:repost" class="size-6" />
          {reposts}
        </button>
        <button onclick={() => toastError("Must be logged in to like")} class="flex gap-1">
          <Icon icon="prime:heart" class="size-6" />
          {likes}
        </button>
      {:else}
        <a href={`/p/${data.post.author.handle}/${record_id}#selected_post`} class="flex gap-1">
          <Icon icon="iconamoon:comment" class="size-6" />
          {data.post.replyCount}
        </a>
        <form 
          method="POST" 
          action="/?/toggleRepostPost" 
          use:enhance={() => {
              return async ({ result }) => {
                // @ts-ignore
                if (result.data.uri === data.post.uri) {
                  // @ts-ignore
                  repostUri = result.data.repostUri;
                  if (repostUri) { reposts++; }
                  else { reposts--; }
                }
                await applyAction(result);
              }
          }}
        >
          <input name="repost_uri" type="hidden" value={repostUri} />
          <input name="post_uri" type="hidden" value={data.post.uri} />
          <input name="post_cid" type="hidden" value={data.post.cid} />
          <button type="submit" class="flex gap-1">
            <Icon 
              icon="bx:repost" 
              class={`size-6 ${repostUri ? "text-green-500" : "text-white"}`} 
            />
            {reposts}
          </button>
        </form>
        <form 
          method="POST" 
          action="/?/toggleLikePost" 
          use:enhance={() => {
              return async ({ result }) => {
                // @ts-ignore
                if (result.data.uri === data.post.uri) {
                  // @ts-ignore
                  likeUri = result.data.likeUri;
                  if (likeUri) { likes++; }
                  else { likes--; }
                }
                await applyAction(result);
              }
          }}
        >
          <input name="like_uri" type="hidden" value={likeUri} />
          <input name="post_uri" type="hidden" value={data.post.uri} />
          <input name="post_cid" type="hidden" value={data.post.cid} />
          <button type="submit" class="flex gap-1">
            <Icon 
              icon={likeUri ? "prime:heart-fill" : "prime:heart"}
              class={`size-6 ${likeUri ? "text-red-500" : "text-white"}`} 
            />
            {likes}
          </button>
        </form>
      {/if}
    </menu>
  </article>
{/if}
