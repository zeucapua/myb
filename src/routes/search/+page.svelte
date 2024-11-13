<script lang="ts">
  import { enhance } from "$app/forms";
    import IconDrawer from "$lib/components/IconDrawer.svelte";
    import { toastSuccess } from "$lib/utils";
  import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
    import Icon from "@iconify/svelte";

  let { form } = $props();
</script>

<h1 class="text-3xl font-bold">Search Handles</h1>

<search>
  <form use:enhance action="?/searchHandle" method="POST">
    <input name="handle" type="search" placeholder="zeu.dev" class="bg-transparent border px-4 py-2 rounded"/>
    <button type="submit" class="border px-4 py-2 rounded">Search</button>
  </form>
</search>

{#snippet profileRow(actor: ProfileView)}
  <section 
    class="flex flex-col gap-4 p-4 border rounded"
  >
    <div class="flex gap-4">
      <a href={`/p/${actor.handle}`} class="flex gap-2 text-lg font-bold hover:underline">
        <img src={actor.avatar} alt={`${actor.handle} profile picture`} class="size-12 rounded" />
      </a>
      <div class="flex flex-col">
        <a href={`/p/${actor.handle}`} class="flex gap-2 text-lg font-bold hover:underline">
          {actor.displayName}
        </a>
        <h3 class="flex gap-2">
          @{actor.handle}
          <IconDrawer>
            {#snippet trigger()}
              <Icon icon="solar:share-bold" />
            {/snippet}

            {#snippet content()}
              <div class="flex flex-col gap-2">
                <a
                  href={`https://${actor.handle}`} 
                  target="_blank" 
                  class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                >
                  <Icon icon="akar-icons:link-out" />
                  Open {actor.handle}
                </a>
                <button 
                  onclick={() => { 
                    navigator.clipboard.writeText(actor.did);
                    toastSuccess("Copied DID");
                  }}
                  class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                >
                  <Icon icon="tabler:copy" />
                  Copy DID
                </button>
                <button 
                  onclick={() => {
                    navigator.clipboard.writeText(actor.handle);
                    toastSuccess("Copied handle");
                  }}
                  class="flex gap-4 items-center hover:bg-white/10 px-4 py-2 rounded transition-all duration-150"
                >
                  <Icon icon="tabler:copy" />
                  Copy Domain
                </button>
              </div>
            {/snippet}
          </IconDrawer>
        </h3>
      </div>
    </div>
    <div class="text-xs prose prose-xs prose-pink prose-invert text-white">
      {#if actor.description !== "undefined"}
        {@html actor.description}
      {/if}
    </div>
  </section>
{/snippet}

{#if form}
  {#if form.success}
    {#each form.actors as actor: ProfileView}
      {@render profileRow(actor)}
    {/each}
  {:else}
    <p>An error occurred :(</p>
  {/if}
{:else}
  <p>Find users by their handle</p>
{/if}
