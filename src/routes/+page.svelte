<script lang="ts">
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data } = $props();
  const profile = data.profile as ProfileViewDetailed | undefined;
  let content = $state("");
</script>

{#if profile}
  <form action="?/createPost" method="POST" class="flex flex-col gap-4 p-8 bg-neutral-100">
    <textarea 
      name="content" 
      bind:value={content} 
      placeholder="Say something nerd" 
      class="bg-white px-4 py-2 h-fit"
      maxlength={300}
    >
    </textarea>
    <button type="submit" class="bg-white px-4 py-2" disabled={content.length === 0}>
      Post
    </button>
  </form>
{/if}
