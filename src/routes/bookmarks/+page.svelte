<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import PostItem from "$lib/components/PostItem.svelte";

  const bookmarksQuery = createQuery({
    queryKey: ["bookmarksQuery"],
    queryFn: async () => {
      const response = await fetch("/api/getBookmarks");
      const { posts } = await response.json();
      return posts;
    }
  });
</script>

<h1 class="text-3xl font-bold">Bookmarks</h1>

{#if $bookmarksQuery.isLoading}
  <p>Loading...</p>
{:else if $bookmarksQuery.data}
  {#if $bookmarksQuery.data.length === 0}
    <p>You don't have any bookmarks</p>
  {:else}
    {#each $bookmarksQuery.data as post}
      <PostItem data={post} />
    {/each}
  {/if}
{/if}
