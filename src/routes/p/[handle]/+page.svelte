<script lang="ts">
  import Icon from "@iconify/svelte";
  import { toastSuccess } from "$lib/utils"; 
  import IconDrawer from "$lib/components/IconDrawer.svelte";
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


<FeedTimeline {form} stringifiedFeed={data.feed} />
