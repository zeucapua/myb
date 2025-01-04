<script lang="ts">
  import { page } from "$app/state";
  import { applyAction, enhance } from "$app/forms";
  import type { Snippet } from "svelte";
  import { toastError } from "$lib/utils";
  import { useQueryClient } from "@tanstack/svelte-query";
  import type { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

  type Props = {
    draftInput?: string;
    replying?: boolean;
    miscInputs?: Snippet;
  };

  let { draftInput = $bindable(""), replying = false, miscInputs }: Props = $props();

  const queryClient = useQueryClient();
</script>

{#if page.data.user}
  <form 
    use:enhance={({ formElement}) => {
      return async ({ result }) => {
        if (replying) {
          // @ts-ignore
          const reply = result.data.newReply as ThreadViewPost;
          await queryClient.cancelQueries({ queryKey: ["threadQuery"] });
          const previousThread = queryClient.getQueryData<{ thread: ThreadViewPost }>(["threadQuery"]);

          if (previousThread) {
            queryClient.setQueryData<{ thread: ThreadViewPost }>(["threadQuery"], {
              thread: {
                ...previousThread.thread,
                replies: [ reply, ...previousThread.thread.replies || [] ]
              }
            });
          }
        }
        formElement.reset();
        await applyAction(result);
      }
    }} 
    action={replying ? "/?/createReply" : "/?/createPost"}
    method="POST" 
    class="flex flex-col gap-4"
  >
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
      <button type="submit" class="w-fit border rounded px-4 py-2 cursor-pointer disabled:cursor-not-allowed" disabled={draftInput.length === 0}>
        Post
      </button>
    </div>

  </form>

{:else}
  <textarea 
    name="content" 
    bind:value={draftInput}
    placeholder="Say something" 
    class="bg-transparent border rounded px-4 py-2"
    style="field-sizing: content;"
    onfocusin={() => toastError("Log in to reply")}
  >
  </textarea>
{/if}
