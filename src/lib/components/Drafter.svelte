<script lang="ts">
  import { page } from "$app/state";
  import { enhance } from "$app/forms";
  import type { Snippet } from "svelte";

  type Props = {
    draftInput?: string;
    miscInputs?: Snippet;
  };

  let { draftInput = $bindable(""), miscInputs }: Props = $props();
</script>

<form use:enhance action="/?/createPost" method="POST" class="flex flex-col gap-4">
  <textarea 
    name="content" 
    bind:value={draftInput} 
    placeholder="Say something" 
    class="bg-transparent border rounded px-4 py-2"
    style="field-sizing: content;"
    maxlength={300}
  >
  </textarea>

  {@render miscInputs?.()}

  <div class="self-end flex gap-2">
    <button formaction="/?/saveDraft" class="w-fit border rounded px-4 py-2" disabled={draftInput.length === 0}>
      Save Draft
    </button>
    <button type="submit" class="w-fit border rounded px-4 py-2" disabled={draftInput.length === 0}>
      Post
    </button>
  </div>

</form>
