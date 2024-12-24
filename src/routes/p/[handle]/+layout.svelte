<script lang="ts">
  import { Button } from "bits-ui";
  import { enhance } from "$app/forms";
  import { toastError } from "$lib/utils"; 
  import type { ActionData } from "./$types";
  import { getContext, onDestroy, type Snippet } from "svelte";
  import ProfileSummary from "$lib/components/ProfileSummary.svelte";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  type Props = {
    data: { user: ProfileViewDetailed, profile: ProfileViewDetailed };
    form: ActionData;
    children: Snippet;
  }

  let { data, children }: Props = $props();
  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  let deleteBottomControl = getContext("deleteBottomControl") as (snippet: Snippet) => void;
  setBottomControls(profileControls);
  onDestroy(() => deleteBottomControl(profileControls));

  $inspect(data.profile.viewer);
</script>

{#snippet profileControls()}
  {#if data.profile.viewer?.following}
    <form use:enhance method="POST" action="?/unfollowUser">
      <input name="follow_uri" type="hidden" value={data.profile.viewer.following} />
      <Button.Root type="submit" class="flex items-center bg-red-500 px-4 py-2 rounded w-full gap-4 text-sm hover:bg-yellow-600/95 active:scale-95 active:transition-all duration-150">
        Unfollow 
      </Button.Root>
    </form>
  {:else if !data.user}
    <Button.Root onclick={() => toastError("Log in to follow")} class="flex text-black items-center bg-yellow-500 px-4 py-2 rounded w-full gap-4 text-sm hover:bg-yellow-600/95 active:scale-95 active:transition-all duration-150">
      Follow
    </Button.Root>
  {:else if data.profile.viewer?.followedBy}
    <form use:enhance method="POST" action="?/followUser">
      <Button.Root type="submit" class="flex text-black items-center bg-yellow-500 px-4 py-2 rounded w-full gap-4 text-sm hover:bg-yellow-600/95 active:scale-95 active:transition-all duration-150">
        Follow
      </Button.Root>
    </form>
  {/if}
{/snippet}

<div class="flex flex-col gap-4 mx-auto w-full max-w-xl">
  <ProfileSummary profile={data.profile} />

  {@render children()}
</div>
