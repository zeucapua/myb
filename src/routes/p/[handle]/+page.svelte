<script lang="ts">
  import FeedTimeline from "$lib/components/FeedTimeline.svelte";

  import type { ActionData } from "./$types";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  type Props = {
    data: {
      profile: ProfileViewDetailed;
      feed: string
    },
    form: ActionData | undefined;
  };

  let { data, form }: Props = $props();
</script>

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

<FeedTimeline {form} stringifiedFeed={data.feed} />
