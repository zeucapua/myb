<script lang="ts">
  import { 
    AppBskyEmbedExternal, 
    AppBskyEmbedImages, 
    AppBskyEmbedRecord, 
    AppBskyEmbedRecordWithMedia, 
    AppBskyEmbedVideo, 
    AppBskyFeedDefs
  } from "@atproto/api";
    import Icon from "@iconify/svelte";

  type Embed =
  | AppBskyEmbedRecord.View
  | AppBskyEmbedImages.View
  | AppBskyEmbedVideo.View
  | AppBskyEmbedExternal.View
  | AppBskyEmbedRecordWithMedia.View
  | {$type: string; [k: string]: unknown}

  let { embed }: { embed: Embed } = $props();
</script>

<!-- Images -->
{#if AppBskyEmbedImages.isView(embed)} 
  {#each (embed.images) as image}
    <img src={image.fullsize} alt={image.alt} />
  {/each}
{:else}
  <div class="text-xs border rounded px-3 py-2 flex items-center gap-2">
    <Icon icon="material-symbols:info-outline" class="text-lg" />
    <p>This embed is not supported yet.</p>
  </div>
{/if}
