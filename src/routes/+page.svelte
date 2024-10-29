<script lang="ts">
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data } = $props();
  const profile = data.profile as ProfileViewDetailed | undefined;
</script>

{#if profile}
  <img src={profile.avatar} alt={`${profile.handle} bsky profile picture`} class="size-24" />
  <p>{profile.handle}</p>
{/if}
