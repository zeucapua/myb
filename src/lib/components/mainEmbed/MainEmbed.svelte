<script lang="ts">
  import Icon from "@iconify/svelte";
  import VideoEmbed from "./VideoEmbed.svelte";
  import PostEmbed from "../viewEmbed/PostEmbed.svelte";
  // import YoutubePlayerEmbed from "./YoutubePlayerEmbed.svelte";

  import { formatDistanceToNowStrict } from "date-fns";
  import { 
    AppBskyEmbedExternal, 
    AppBskyEmbedImages, 
    AppBskyEmbedRecord, 
    AppBskyEmbedRecordWithMedia, 
    AppBskyEmbedVideo, 
    AppBskyFeedDefs,
    AppBskyGraphDefs,
    AtUri,
  } from "@atproto/api";
  import type { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record";
  import type { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  type Props = {
    embed: MainEmbed;
    author_did: string;
    disableQuotes?: boolean;
  }

  let { embed, author_did, disableQuotes = false }: Props = $props();

  function getStarterPackOgCard(
      didOrStarterPack: AppBskyGraphDefs.StarterPackView | string,
      rkey?: string,
  ) {
    if (typeof didOrStarterPack === 'string') {
      return `https://ogcard.cdn.bsky.app/start/${didOrStarterPack}/${rkey}`
    } 
    else {
      const rkey = new AtUri(didOrStarterPack.uri).rkey
      return `https://ogcard.cdn.bsky.app/start/${didOrStarterPack.creator.did}/${rkey}`
    }
  }

  console.log({ embed });
</script>

