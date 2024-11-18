<script lang="ts">
  import Icon from "@iconify/svelte";
  import { enhance } from "$app/forms";
  import { toastError, toastSuccess } from "$lib/utils"; 
  import { createQuery } from "@tanstack/svelte-query";
  import IconDrawer from "$lib/components/IconDrawer.svelte";
  import { getContext, onDestroy, type Snippet } from "svelte";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  type Props = {
    data: { user: ProfileViewDetailed, did: string };
    children: Snippet;
  }

  let { data, children }: Props = $props();
  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  let deleteBottomControl = getContext("deleteBottomControl") as (snippet: Snippet) => void;

  onDestroy(() => deleteBottomControl(profileControls));

  const profileQuery = createQuery({
    queryKey: ["profileQuery"],
    queryFn: async () => {
      const response = await fetch(`/api/getProfile?actor=${data.did}`);
      const { profile } = await response.json() as { profile: ProfileViewDetailed };
      return { profile }; 
    }
  });

  setBottomControls(profileControls);
</script>

{#snippet profileControls()}
  {#if $profileQuery.isLoading}
    <p>Loading...</p>
  {:else if $profileQuery.isSuccess}
    {#if $profileQuery.data.profile.viewer?.following || false}
      <form use:enhance method="POST" action="?/unfollowUser">
        <input name="follow_uri" type="hidden" value={$profileQuery.data.profile.viewer?.following} />
        <button type="submit" class="px-2 py-1 border rounded border-red-500">
          Unfollow 
        </button>
      </form>
    {:else if !data.user}
      <button onclick={() => toastError("Log in to follow")} class="px-2 py-1 border rounded border-yellow-500">
        Follow
      </button>
    {:else if !$profileQuery.data.profile.viewer?.followedBy || false}
      <form use:enhance method="POST" action="?/followUser">
        <button type="submit" class="px-2 py-1 border rounded border-yellow-500">
          Follow
        </button>
      </form>
    {/if}
  {/if}
{/snippet}

<div class="flex flex-col gap-4 mx-auto w-full max-w-xl">

  {#if $profileQuery.isSuccess && $profileQuery.data}
    <section class="flex flex-col gap-4">
      <div class="flex gap-4 items-center">
        <img src={$profileQuery.data.profile.avatar} alt={`${$profileQuery.data.profile.handle} profile picture`} class="size-16 rounded" />
        <div class="flex flex-col">
          <h1 class="text-lg font-bold">{$profileQuery.data.profile.displayName}</h1>
          <h2 class="font-medium flex items-center gap-2">
            @{$profileQuery.data.profile.handle}
            <IconDrawer>
              {#snippet trigger()}
                <Icon icon="solar:share-bold" />
              {/snippet}

              {#snippet content()}
                <div class="flex flex-col gap-2">
                  <a
                    href={`https://${$profileQuery.data.profile.handle}`} 
                    target="_blank" 
                    class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                  >
                    <Icon icon="akar-icons:link-out" />
                    Open {$profileQuery.data.profile.handle}
                  </a>
                  <button 
                    onclick={() => { 
                      navigator.clipboard.writeText($profileQuery.data.profile.did);
                      toastSuccess("Copied DID");
                    }}
                    class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                  >
                    <Icon icon="tabler:copy" />
                    Copy DID
                  </button>
                  <button 
                    onclick={() => {
                      navigator.clipboard.writeText($profileQuery.data.profile.handle);
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

            <a href={`/p/${$profileQuery.data.profile.handle}/stats`}>
              <Icon icon="gridicons:stats-alt" />
            </a>
          </h2>
          <div class="flex gap-4">
            <p>{$profileQuery.data.profile.followersCount} Followers</p>
            <p>{$profileQuery.data.profile.followsCount} Following</p>
          </div>
        </div>
      </div>

      <div class="text-xs prose prose-invert prose-p:text-white prose-sm prose-pink"> 
        {@html $profileQuery.data.profile.description}
      </div>
    </section>
  {:else if $profileQuery.isLoading}
    <p>Loading</p>
  {:else if $profileQuery.isError}
    <p>Error</p>
  {/if}

  {@render children()}
</div>
