<script lang="ts">
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data } = $props();
  const profile = data.profile as ProfileViewDetailed | undefined;
  let content = $state("");
</script>

{#if !profile}
  <h1 class="text-4xl font-bold">myb: power user's bluesky client</h1>
  <p>Login to start cool tools or start exploring!</p>

  <section class="flex flex-col gap-2">
    <h2 class="text-xl font-bold">Sections</h2>
    <ul class="list-disc list-inside">
      <li>
        <a href="/search" class="underline">Search</a>
        <p>Find people using their handle</p>
      </li>

      <li>
        <a href="/feeds" class="underline">Feeds</a>
        <p>Niches and trends, all sorted by users, for you!</p>
      </li>
    </ul>
  </section>
{/if}

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
