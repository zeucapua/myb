<script lang="ts">
  import "vidstack/bundle";
  import type { AppBskyEmbedExternal } from "@atproto/api";
  
  let { embed }: { embed: AppBskyEmbedExternal.View } = $props();
  const uri = new URL(embed.external.uri);
</script>

<media-player title={embed.external.title} src={`youtube/${uri.pathname.substring(1,)}`} controls autoPlay muted>
  <media-provider></media-provider>
</media-player>
