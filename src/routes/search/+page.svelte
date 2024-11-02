<script lang="ts">
  import { enhance } from "$app/forms";
  let { form } = $props();
</script>

<h1>Search Handles</h1>

<search>
  <form use:enhance action="?/searchHandle" method="POST">
    <input name="handle" type="search" placeholder="zeu.dev" class="bg-transparent border px-4 py-2 rounded"/>
    <button type="submit" class="border px-4 py-2 rounded">Search</button>
  </form>
</search>


{#if form}
  {#if form.success}
    {#each form.actors as actor: ProfileView}
      <a href={`/p/${actor.handle}`} class="flex gap-4">
        <img src={actor.avatar} alt={`${actor.handle} profile picture`} class="size-8" />
        <p>{actor.displayName} <span>{actor.handle}</span></p>
      </a>
    {/each}
  {:else}
    <p>An error occurred :(</p>
  {/if}
{:else}
  <p>Find users by their handle</p>
{/if}
