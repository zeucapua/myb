<script lang="ts">
  import '../app.css';
  import { dev } from '$app/environment';
  import { inject } from '@vercel/analytics';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

  inject({ mode: dev ? 'development' : 'production' });

	let { data, children } = $props();
  const profile = data.profile as ProfileViewDetailed;
</script>

<div class="flex flex-col gap-8 w-full h-full min-w-screen min-h-screen p-8 bg-slate-800 text-white">
  <nav class="flex gap-4 justify-between items-center">
    <a href="/" class="font-bold text-xl">myb 🦋</a>
    <div class="flex gap-4 items-center">
      <a href="/search" class="border px-4 py-2 rounded">Search</a>
      <a href="/feeds" class="border px-4 py-2 rounded">Feeds</a>
    </div>
    {#if profile}
      <form action="/?/logout" method="POST" class="flex gap-4">
        <img src={profile.avatar} alt={`${profile.handle} profile picture`} class="size-10 rounded" />
        <button type="submit" class="border rounded px-4 py-2">Logout</button>
      </form>
    {:else}
      <form action="/?/login" method="POST"> 
        <input type="text" name="handle" placeholder="zeu.dev" class="border rounded px-4 py-2 bg-transparent" />
        <button type="submit" class="border rounded px-4 py-2">Login</button>
      </form>
    {/if}
  </nav>

  {@render children()}
</div>
