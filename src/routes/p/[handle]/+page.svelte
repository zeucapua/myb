<script lang="ts">
  import Icon from "@iconify/svelte";
  import { toastSuccess } from "$lib/utils"; 
  import IconDrawer from "$lib/components/IconDrawer.svelte";
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";

  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
  import { enhance } from "$app/forms";
    import { getContext, onDestroy, type Snippet } from "svelte";

  let { data }: { data: { profile: ProfileViewDetailed }} = $props();
  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  let deleteBottomControl = getContext("deleteBottomControl") as (snippet: Snippet) => void;
  setBottomControls(profileControls);

  onDestroy(() => deleteBottomControl(profileControls));


  const authorFeedQuery = createInfiniteQuery({
    queryKey: ["authorFeed"],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      queryParams.set("actor", data.profile.did); 
      queryParams.set("cursor", pageParam || "");
      const response = await fetch(`/api/getAuthorFeed?${queryParams.toString()}`);
      const results = await response.json() as { feed: FeedViewPost[], nextCursor: string }; 
      return results; 
    },
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor
  });

  let authorFeed = $derived.by(() => {
    return $authorFeedQuery.data?.pages.flatMap(page => page.feed) as FeedViewPost[] ?? []
  });
</script>

{#snippet profileControls()}
  {#if data.profile.viewer!.following}
    <form use:enhance method="POST" action="?/unfollowUser">
      <input name="follow_uri" type="hidden" value={data.profile.viewer?.following} />
      <button type="submit" class="px-2 py-1 border rounded border-red-500">
        Unfollow 
      </button>
    </form>
  {:else if !data.profile.viewer!.followedBy}
    <form use:enhance method="POST" action="?/followUser">
      <button type="submit" class="px-2 py-1 border rounded border-yellow-500">
        Follow
      </button>
    </form>
  {/if}
{/snippet}

<div class="flex flex-col gap-4 mx-auto w-full max-w-xl">

  <section class="flex flex-col gap-4">
    <div class="flex gap-4 items-center">
      <img src={data.profile.avatar} alt={`${data.profile.handle} profile picture`} class="size-16 rounded" />
      <div class="flex flex-col">
        <h1 class="text-lg font-bold">{data.profile.displayName}</h1>
        <h2 class="font-medium flex items-center gap-2">
          @{data.profile.handle}
          <IconDrawer>
            {#snippet trigger()}
              <Icon icon="solar:share-bold" />
            {/snippet}

            {#snippet content()}
              <div class="flex flex-col gap-2">
                <a
                  href={`https://${data.profile.handle}`} 
                  target="_blank" 
                  class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                >
                  <Icon icon="akar-icons:link-out" />
                  Open {data.profile.handle}
                </a>
                <button 
                  onclick={() => { 
                    navigator.clipboard.writeText(data.profile.did);
                    toastSuccess("Copied DID");
                  }}
                  class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                >
                  <Icon icon="tabler:copy" />
                  Copy DID
                </button>
                <button 
                  onclick={() => {
                    navigator.clipboard.writeText(data.profile.handle);
                    toastSuccess("Copied handle");
                  }}
                  class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                >
                  <Icon icon="tabler:copy" />
                  Copy Domain
                </button>
              </div>
            {/snippet}
          </IconDrawer>
        </h2>
        <div class="flex gap-4">
          <p>{data.profile.followersCount} Followers</p>
          <p>{data.profile.followsCount} Following</p>
        </div>
      </div>
    </div>

    <div class="text-xs prose prose-invert prose-p:text-white prose-sm prose-pink"> 
      {@html data.profile.description}
    </div>
  </section>
  <section class="flex flex-col gap-4 items-center w-full">
    {#if $authorFeedQuery.isLoading}
      <p>Loading...</p>
    {:else if $authorFeedQuery.isError}
      <p>Error</p>
    {:else if $authorFeedQuery.isSuccess}
      <FeedTimeline feed={authorFeed} />
      <button 
        onclick={() => { 
          $authorFeedQuery.fetchNextPage(); 
        }}
        class="px-4 py-2 border rounded"
      >
        Load more...
      </button>
    {/if}
  </section>
</div>
