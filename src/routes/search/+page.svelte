<script lang="ts">
  import { enhance } from "$app/forms";
  import ProfileSummary from "$lib/components/ProfileSummary.svelte";
    import Icon from "@iconify/svelte";

  let { form } = $props();
</script>

<div class="mx-auto flex flex-col gap-8 w-full max-w-[32rem]">
  <h1 class="text-3xl font-bold">Search Handles</h1>

  <search>
    <form use:enhance action="?/searchHandle" method="POST">
      <input name="handle" type="search" placeholder="zeu.dev" class="bg-transparent border px-4 py-2 rounded-sm"/>
      <button type="submit" class="border px-4 py-2 rounded-sm">Search</button>
    </form>
  </search>

  {#if form}
    {#if form.success}
      <ul class="flex flex-col gap-4">
        {#each form.actors as actor: ProfileView}
          <li class="flex justify-between border p-4 rounded-sm w-full max-w-[32rem]">
            <ProfileSummary profile={actor} hideFollowStats />
            <a href={`/p/${actor.handle}`} class="flex gap-2 items-center self-start">
              <p class="text-sm">Profile</p>
              <Icon icon="ep:right" />
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <p>An error occurred :(</p>
    {/if}
  {:else}
    <p>Find users by their handle</p>
  {/if}
</div>
