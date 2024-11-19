<script lang="ts">
  let { data } = $props();
  const bookmarks = data.bookmarks;
</script>

{#each bookmarks as bookmark}
  <p>{bookmark}</p>
{/each}
