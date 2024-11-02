<script lang="ts">
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data } = $props();
  const profile = data.profile as ProfileViewDetailed | undefined;
  let content = $state("");
</script>

{#if profile}
  <form action="?/createPost" method="POST" class="flex flex-col gap-4 p-8">
    <textarea 
      name="content" 
      bind:value={content} 
      placeholder="Say something" 
      class="bg-transparent border rounded px-4 py-2"
      style="field-sizing: content;"
      maxlength={300}
    >
    </textarea>
    <button type="submit" class="w-fit border rounded self-end px-4 py-2" disabled={content.length === 0}>
      Post
    </button>
  </form>
{/if}
