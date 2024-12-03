<script lang="ts">
  import "vidstack/bundle";
  import { createQuery } from "@tanstack/svelte-query";
  import type { AppBskyEmbedVideo } from "@atproto/api";

  let { embed, author_did }: { embed: AppBskyEmbedVideo.Main, author_did: string } = $props();

  const videoQuery = createQuery({
    queryKey: ["authorFeed"],
    queryFn: async () => {
      const response = await fetch(`/api/getVideo?actor=${author_did}&cid=${embed.video.ref.$link}`);
      const data = await response.json();
      return data;
    }
  });

  $inspect($videoQuery);
</script>

{#if $videoQuery.isLoading}
  <p>Loading...</p>
{:else}
  <media-player title={embed.alt} src={$videoQuery.data.url} controls hideControlsOnMouseLeave autoPlay muted loop>
    <media-provider></media-provider>
  </media-player>
{/if}
