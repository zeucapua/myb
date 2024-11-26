<script lang="ts">
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
  import type { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
  import { formatDistanceToNowStrict } from "date-fns";
  
  type Post = Record & { html: string };
  type Props = {
     data: { post: string, author: ProfileViewDetailed }
  }
  let { data }: Props = $props();
  let post = $derived(JSON.parse(data.post) as Post);
</script>

<main class="flex flex-col gap-8">
  <div class="text-md flex gap-2 items-center">
    <a href={`/p/${data.author.handle}`} >
      <img 
        src={data.author.avatar} 
        alt={`${data.author.handle} profile picture`} 
        class="size-12 rounded"
      />
    </a>
    <div class="flex flex-col hover:underline ">
      <a href={`/p/${data.author.handle}`} >
        <p class="flex gap-1 items-center">
          {data.author.displayName} 
          <span class="text-xs">@{data.author.handle}</span>
        </p>
      </a>
      <time class="text-sm font-light">
        {formatDistanceToNowStrict(new Date(post.createdAt))} ago
      </time>
    </div>
  </div>

  <div class="text-lg prose prose-invert prose-p:text-white prose-sm prose-pink"> 
    {@html post.html}
  </div>
</main>
