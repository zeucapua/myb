<script lang="ts">
  import "vidstack/bundle";
  import type { AppBskyEmbedVideo } from "@atproto/api";

  let { embed }: { embed: AppBskyEmbedVideo.View } = $props();
</script>

<media-player title={embed.alt} src={embed.playlist} controls autoPlay muted>
  <media-provider></media-provider>
</media-player>
