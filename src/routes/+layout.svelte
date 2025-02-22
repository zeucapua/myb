<script lang="ts">
  import '../app.css';
  import { Button } from 'bits-ui';
  import Icon from "@iconify/svelte";
  import { toastError } from "$lib/utils";
  import { browser } from '$app/environment';
  import { Toaster } from 'svelte-french-toast';
  import { setContext, type Snippet } from 'svelte';
  import Drafter from '$lib/components/Drafter.svelte';
  import IconDrawer from '$lib/components/IconDrawer.svelte';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

	let { data, children } = $props();
  const user = data.user as ProfileViewDetailed;

  // for individual pages/layouts to implement in context controls
  let bottomControls = $state<Snippet[]>([]);
  let setBottomControls = (snippet: Snippet) => bottomControls.push(snippet);
  let deleteBottomControl = (snippet: Snippet) => bottomControls = bottomControls.filter((s) => s != snippet);
  setContext("setBottomControls", setBottomControls);
  setContext("deleteBottomControl", deleteBottomControl);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  });

  let handleInput = $state("");
  let stayLoggedInChecked = $state(false);
</script>

<svelte:head>
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="myb.zeu.dev">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="viewport" content="viewport-fit=cover, user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">
  <script 
    defer 
    data-site-id="myb.zeu.dev" 
    src="https://assets.onedollarstats.com/tracker.js"
  > 
  </script>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <div class="font-switzer relative w-screen h-full min-h-screen bg-slate-800 text-white pt-4 pb-8">
    <Toaster />
    <main class="flex flex-col gap-4 p-6 pb-16">
      <nav class="flex gap-4 justify-between items-center">
        <a href="/" class="font-bold text-xl flex gap-2">
          <Icon icon="game-icons:butterfly-warning" class="size-8" />
          myb
        </a>
        <div class="flex gap-4 items-center">
          {#if user}
            <form action="/?/logout" method="POST" class="flex gap-4">
              <a href={`/p/${user.handle}`} data-sveltekit-reload>
                <img src={user.avatar} alt={`${user.handle} profile picture`} class="size-10 rounded-sm" />
              </a>
              <button 
                type="submit" 
                class="border rounded-sm px-4 py-2"
              >
                Logout
              </button>
            </form>
          {:else}
            <form action="/?/login" method="POST" class="flex flex-col gap-2 items-end"> 
              <div class="flex gap-2">
                <input 
                  type="text" 
                  name="handle" 
                  placeholder="zeu.dev" 
                  bind:value={handleInput}
                  class="border rounded-sm px-4 py-2 bg-transparent max-w-32 h-fit" 
                />
                <button 
                  type="submit" 
                  disabled={!handleInput}
                  class="border rounded-sm px-4 py-2"
                >
                  Login
                </button>
              </div>
              <label for="stay_logged_in">
                <input
                  type="checkbox"
                  name="stay_logged_in"
                  bind:checked={stayLoggedInChecked}
                />
                Stay Logged In
              </label>
            </form>
          {/if}
        </div>
      </nav>

      {@render children()}
    </main>

    {#snippet PostDrawerTrigger()}
      <Button.Root
        onclick={() => { 
          if (!user) { toastError("Must be logged in to post"); } 
        }}
        class="fixed bottom-20 right-4 z-50 rounded-full flex items-center bg-pink-500 p-4 w-fit gap-4 hover:bg-pink-600/95 active:scale-95 active:transition-all duration-150"
      >
        <Icon icon="hugeicons:quill-write-02" class="size-6" />
      </Button.Root>
    {/snippet}
    {#if !user}
      {@render PostDrawerTrigger()}
    {:else}
      <IconDrawer
        trigger={PostDrawerTrigger}
      >
        {#snippet content()}
          <Drafter />
        {/snippet}
      </IconDrawer>
    {/if}

    <menu class="z-10 flex flex-col gap-4 items-end fixed bottom-0 inset-x-0"> 
      <section class="flex w-full h-fit p-4 border-t justify-between bg-slate-800">
        <div class="w-fit flex gap-4 items-center">
          <a href="/search">
            <Icon icon="heroicons:magnifying-glass-solid" class="size-8" />
          </a>
          {#if user}
            <a href="/bookmarks">
              <Icon icon="hugeicons:all-bookmark" class="size-8" />
            </a>
          {:else}
            <button
              onclick={() => {
                toastError("Log in to see bookmarks");
              }}
            >
              <Icon icon="hugeicons:all-bookmark" class="size-8" />
            </button>
          {/if}
          <a href="/">
            <Icon icon="iconamoon:home-light" class="size-8" />
          </a>

        </div>

        <div class="flex gap-4 self-end items-center">
          {#if bottomControls.length > 0}
            {#each bottomControls as controller: Snippet}
              {@render controller()}
            {/each}
          {/if}
        </div>
      </section>
    </menu>
  </div>
</QueryClientProvider>
