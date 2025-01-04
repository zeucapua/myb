<script lang="ts">
  import { enhance } from "$app/forms";
    import Drafter from "$lib/components/Drafter.svelte";
  import * as schema from "$lib/schema";

  let { data } = $props();
  let content = $state("");
  let currentDraftId = $state("");

  function editDraft(draft: typeof schema.DraftPost.$inferSelect) {
    content = draft.content ?? "";
    currentDraftId = draft.id;
  }
</script>

<h1 class="text-3xl font-bold">Drafts</h1>
<Drafter bind:draftInput={content} />

<div class="w-full h-0.5 bg-white"></div>

<h2 class="text-2xl font-bold">Saved Drafts</h2>
{#if data.drafts.length === 0}
  <p>No drafts saved.</p>
{:else}
  {#each data.drafts as draft: DraftPost.$inferSelect}
    <article class="flex flex-col gap-4 border p-4 rounded">
      <p>{draft.content}</p>
      <div class="flex gap-4">
        <button onclick={() => editDraft(draft)}>Write</button>
        <form use:enhance action="/?/deleteDraft" method="POST">
          <input name="id" type="hidden" value={draft.id} />
          <button type="submit">Delete</button>
        </form>
      </div>
    </article>
  {/each}
{/if}
