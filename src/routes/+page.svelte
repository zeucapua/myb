<script lang="ts">
  import * as schema from "$lib/schema";
  import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

  let { data } = $props();
  const user = data.user as ProfileViewDetailed | undefined;
  let content = $state("");
  let currentDraftId = $state("");

  function editDraft(draft: typeof schema.DraftPost.$inferSelect) {
    content = draft.content ?? "";
    currentDraftId = draft.id;
  }
</script>

{#if !user}
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

{#if user}
  <h1 class="text-3xl font-bold">Console</h1>
  <form action="?/createPost" method="POST" class="flex flex-col gap-4">
    <input name="draft_id" type="hidden" bind:value={currentDraftId} />
    <textarea 
      name="content" 
      bind:value={content} 
      placeholder="Say something" 
      class="bg-transparent border rounded px-4 py-2"
      style="field-sizing: content;"
      maxlength={300}
    >
    </textarea>
    <div class="self-end flex gap-2">
      <button formaction="?/saveDraft" class="w-fit border rounded px-4 py-2" disabled={content.length === 0}>
        Save Draft
      </button>
      <button type="submit" class="w-fit border rounded px-4 py-2" disabled={content.length === 0}>
        Post
      </button>
    </div>
  </form>

  <h2 class="text-2xl font-bold">Drafts</h2>
  {#if data.drafts.length === 0}
    <p>No drafts saved.</p>
  {:else}
    {#each data.drafts as draft: DraftPost.$inferSelect}
      <article class="flex flex-col gap-4 border p-4 rounded">
        <p>{draft.content}</p>
        <div class="flex gap-4">
          <button onclick={() => editDraft(draft)}>Write</button>
          <form action="?/deleteDraft" method="POST">
            <input name="id" type="hidden" value={draft.id} />
            <button type="submit">Delete</button>
          </form>
        </div>
      </article>
    {/each}
  {/if}
{/if}
