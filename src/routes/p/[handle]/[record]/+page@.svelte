<script lang="ts">
  import MainEmbed from '$lib/components/mainEmbed/MainEmbed.svelte';
import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs.js';
  import type { Record } from '@atproto/api/dist/client/types/app/bsky/feed/post';
  import { formatDistanceToNowStrict } from 'date-fns';

  type Props = {
    data: {
      post: string;
      author: ProfileViewDetailed
    }
  }

  let { data }: Props = $props();
  let post = $derived(JSON.parse(data.post) as Record & { html: string });
  let author = data.author;
</script>

<article class="flex flex-col gap-8">
  <div class="text-sm flex gap-2 items-center">
    <a href={`/p/${author.handle}`}>
      <img 
        src={author.avatar} 
        alt={`${author.handle} profile picture`} 
        class="size-8 rounded"
      />
    </a>
    <div class="flex flex-col">
      <a href={`/p/${author.handle}`}>
        <p class="flex gap-1 items-center">
          {author.displayName} 
          <span class="text-xs">@{author.handle}</span>
        </p>
      </a>
      <time class="text-xs font-light">
        {formatDistanceToNowStrict(new Date(post.createdAt))} ago
      </time>
    </div>
  </div>

  <div class="prose prose-invert text-white prose-pink text-lg">
    {@html post.html}
  </div>

  {#if post.embed}
    <MainEmbed embed={post.embed} author_did={author.did} />
  {/if}
</article>
