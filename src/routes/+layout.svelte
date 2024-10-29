<script lang="ts">
  import '../app.css';
	let { data, children } = $props();
  const profile = data.profile;
</script>

{#if profile}
  <form action="?/logout" method="POST" class="flex flex-col gap-4 p-8 bg-neutral-100">
    <button type="submit" class="bg-white px-4 py-2">Logout</button>
  </form>
{:else}
  <form action="?/login" method="POST" class="flex flex-col gap-4 p-8 bg-neutral-100">
    <input type="text" name="handle" placeholder="zeu.dev" class="bg-white px-4 py-2" />
    <button type="submit" class="bg-white px-4 py-2">Login</button>
  </form>
{/if}

{@render children()}
