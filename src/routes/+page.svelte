<script lang="ts">
  let { data } = $props();
  const feed = data.feed.length > 0 && JSON.parse(data.feed as string);
  console.log({ parsed: feed, raw: data.feed });
</script>

<form action="?/login" method="POST" class="flex flex-col gap-4 p-8 bg-neutral-100">
  <input type="text" name="handle" placeholder="zeu.dev" class="bg-white px-4 py-2" />
  <button type="submit" class="bg-white px-4 py-2">Login</button>
</form>

{#each feed as post}
  <p>{post.post.record.text}</p> 
{/each}
