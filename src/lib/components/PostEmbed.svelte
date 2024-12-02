<script lang="ts">
  import Icon from "@iconify/svelte";
  import PostEmbed from "./PostEmbed.svelte";
  import HlsPlayerEmbed from "./HlsPlayerEmbed.svelte";
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
    import YoutubePlayerEmbed from "./YoutubePlayerEmbed.svelte";

  type Embed =
  | AppBskyEmbedRecord.View
  | AppBskyEmbedImages.View
  | AppBskyEmbedVideo.View
  | AppBskyEmbedExternal.View
  | AppBskyEmbedRecordWithMedia.View
  | {$type: string; [k: string]: unknown}

  let { embed, disableQuotes = false }: { embed: Embed, disableQuotes?: boolean } = $props();

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

<!-- Images -->
{#if AppBskyEmbedImages.isView(embed)} 
  {#each (embed.images) as image}
    <img src={image.fullsize} alt={image.alt} />
  {/each}

<!-- External links -->
{:else if AppBskyEmbedExternal.isView(embed)}
  <a href={embed.external.uri} target="_blank">
    {#if embed.external.uri.includes("media.tenor.com") || embed.external.uri.includes("i.giphy.com")}
      <img src={embed.external.uri} alt={embed.external.description} />
    {:else if embed.external.uri.includes("youtu.be")}
      <YoutubePlayerEmbed {embed} /> 
    {:else}
      <div class="flex flex-col rounded border">
        <img src={embed.external.thumb} alt={embed.external.description} class="w-full h-full aspect-[1.91/1] object-cover" />
        <div class="p-3 flex flex-col gap-2">
          <h1 class="font-medium">{embed.external.title || embed.external.uri}</h1>
          <p>{embed.external.description}</p>
        </div>
      </div>
    {/if}
  </a>

<!-- Video -->
{:else if AppBskyEmbedVideo.isView(embed)}
  <HlsPlayerEmbed {embed} />

{:else if !disableQuotes}
  <!-- Quote Post with Embeds -->
  {#if AppBskyEmbedRecordWithMedia.isView(embed)}
    <PostEmbed embed={embed.media} /> <!-- Author embeds -->
    {@render quotePost(embed.record.record as ViewRecord)}
    
  <!-- Bsky Record (quote, starter pack, list) -->
  {:else if AppBskyEmbedRecord.isView(embed)}
    <!-- Feed -->
    {#if AppBskyFeedDefs.isGeneratorView(embed.record)}
      <!-- TODO: link to Feed page /p/<handle>/f/<record_id> -->
      <div class="border rounded flex p-3 gap-4">
        {#if embed.record.avatar}
          <img src={embed.record.avatar} class="size-8" alt={`${embed.record.displayName} feed`} />
        {:else}
          <Icon icon="hugeicons:satellite-03" class="size-12 p-2 bg-blue-500 rounded"/>
        {/if}
        <div class="flex flex-col gap-2">
          <div class="flex flex-col">
            <h1 class="font-bold">{embed.record.displayName}</h1>
            <h2 class="text-sm font-medium">by @{embed.record.creator.handle}</h2>
          </div>
          <p class="text-xs">{embed.record.description}</p>
        </div>
      </div>

    <!-- List -->
    {:else if AppBskyGraphDefs.isListView(embed.record)}
      <!-- TODO: link to List page /p/<handle>/l/<record_id> -->
      <div class="border rounded flex p-3 gap-4">
        {#if embed.record.avatar}
          <img src={embed.record.avatar} class="size-8" alt={`${embed.record.displayName} feed`} />
        {:else}
          <Icon icon="hugeicons:satellite-03" class="size-12 p-2 bg-blue-500 rounded"/>
        {/if}
        <div class="flex flex-col gap-2">
          <div class="flex flex-col">
            <h1 class="font-bold">{embed.record.name}</h1>
            <h2 class="text-sm font-medium">by @{embed.record.creator.handle}</h2>
          </div>
          <p class="text-xs">{embed.record.description}</p>
          <div class="flex items-center text-sm gap-2">
            <Icon icon="bi:people-fill" /> 
            <p>{embed.record.listItemCount} {embed.record.listItemCount === 1 ? "person" : "people"}</p>
          </div>
        </div>
      </div>

    <!-- Starter Pack -->
    {:else if AppBskyGraphDefs.isStarterPackViewBasic(embed.record)}
      <!-- TODO: link to Starter Pack page /p/<handle>/sp/<record_id> -->
      <div class="border rounded flex flex-col gap-2">
        <img 
          src={getStarterPackOgCard(embed.record)} 
          alt={`${embed.record.record.name} starter pack OG image`} 
          class="rounded shadow-md shadow-slate-900"
        />

        <div class="flex flex-col p-3">
          <h1 class="font-bold">{embed.record.record.name}</h1>
          <h2 class="text-sm font-medium">by @{embed.record.creator.handle}</h2>
          <p class="text-xs">{embed.record.record.description}</p>
        </div>
      </div>
    {:else}
      {@render quotePost(embed.record as ViewRecord)}
    {/if}
  {:else}
    <!-- Unsupported Embed -->
    <div class="text-xs border rounded px-3 py-2 flex items-center gap-2">
      <Icon icon="material-symbols:info-outline" class="text-lg" />
      <p>This embed is not supported yet.</p>
      <code>{embed.$type}</code> 
    </div>
  {/if}
{/if}


{#snippet quotePost(record: ViewRecord)}
  <article class="border p-3 rounded flex flex-col gap-4">
    <div class="flex items-center justify-between w-full">
      <a href={`/p/${(record.author as ProfileViewBasic).handle}`} class="text-sm hover:underline flex gap-2 items-center">
        <img 
          src={(record.author as ProfileViewBasic).avatar} 
          alt={`${(record.author as ProfileViewBasic).handle} profile picture`} 
          class="size-8 rounded"
        />
        <div class="flex flex-col">
          <p class="flex gap-1 items-center">
            {(record.author as ProfileViewBasic).displayName} 
            <span class="text-xs">@{(record.author as ProfileViewBasic).handle}</span>
          </p>
          <time class="text-xs font-light">
            {formatDistanceToNowStrict(new Date(record.indexedAt as string))} ago
          </time>
        </div>
      </a>
    </div>

    <div class="prose prose-invert prose-pink text-xs text-white">
      {@html record.html}
    </div>
    
    {#if record.embeds}
      {#each record.embeds as embed}
        <PostEmbed {embed} disableQuotes />
      {/each}
    {/if}
  </article>
{/snippet}
