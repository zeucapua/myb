<script lang="ts">
  import '../app.css';
  import Icon from "@iconify/svelte";
  import { dev } from '$app/environment';
  import { inject } from '@vercel/analytics';
  import toast, { Toaster } from 'svelte-french-toast';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
    import { goto } from '$app/navigation';

  inject({ mode: dev ? 'development' : 'production' });

	let { data, children } = $props();
  const user = data.user as ProfileViewDetailed;

  function toastComingSoon() {
    toast("Coming soon", {
      icon: "🙊" 
    });
  }

  function toastError(text: string) {
    toast(text, {
      icon: "🚨" 
    });
  }
</script>

<div class="relative w-full h-full min-w-screen min-h-screen bg-slate-800 text-white">
  <Toaster />
  <main class="flex flex-col gap-4 p-6 pb-16">
    <nav class="flex gap-4 justify-between items-center">
      <a href="/" class="font-bold text-xl flex gap-2">
        <Icon icon="game-icons:butterfly-warning" class="size-8" />
        myb
      </a>
      <div class="flex gap-4 items-center">
        <a href="/search" class="underline underline-offset-4">Search</a>
        <a href="/feeds" class="underline underline-offset-4">Feeds</a>
      </div>
    </nav>

    {@render children()}
  </main>

  <menu class="fixed bg-slate-800 bottom-0 inset-x-0 flex w-full h-fit px-4 py-2 border-t justify-between">
    <div class="flex gap-4">
      <button onclick={() => { !user ? toastError("Must be logged in to post") : goto("/") }}>
        <Icon icon="hugeicons:quill-write-02" class="size-8" />
      </button>
      <button onclick={toastComingSoon}>
        <Icon icon="hugeicons:all-bookmark" class="size-8" />
      </button>
    </div>
    {#if user}
      <form action="/?/logout" method="POST" class="flex gap-4">
        <a href={`/p/${user.handle}`}>
          <img src={user.avatar} alt={`${user.handle} profile picture`} class="size-10 rounded" />
        </a>
        <button type="submit" class="border rounded px-4 py-2">Logout</button>
      </form>
    {:else}
      <form action="/?/login" method="POST" class="flex gap-2"> 
        <input type="text" name="handle" placeholder="zeu.dev" class="border rounded px-4 py-2 bg-transparent max-w-32" />
        <button type="submit" class="border rounded px-4 py-2">Login</button>
      </form>
    {/if}
  </menu>
</div>

