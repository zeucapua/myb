<script lang="ts">
  import '../app.css';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

	let { data, children } = $props();
  const profile = data.profile as ProfileViewDetailed;
</script>

<div class="flex flex-col gap-8 w-screen h-screen p-8">
  <nav class="flex gap-4 justify-between items-center">
    <a href="/" class="font-bold text-xl">myb 🦋</a>
    {#if profile}
      <form action="?/logout" method="POST" class="flex gap-4">
        <img src={profile.avatar} alt={`${profile.handle} profile picture`} class="size-10 rounded" />
        <button type="submit" class="border rounded px-4 py-2">Logout</button>
      </form>
    {:else}
      <form action="?/login" method="POST"> 
        <input type="text" name="handle" placeholder="zeu.dev" class="border rounded px-4 py-2" />
        <button type="submit" class="border rounded px-4 py-2">Login</button>
      </form>
    {/if}
  </nav>

  {@render children()}
</div>
