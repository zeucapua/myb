<script lang="ts">
  import { Drawer, type DrawerDirection } from "vaul-svelte";
  import type { Snippet } from "svelte";

  type Props = {
    trigger: Snippet;
    content: Snippet;
    direction?: DrawerDirection;
  }

  let { trigger, content, direction = "bottom" }: Props = $props();
</script>

<Drawer.Root {direction}>
  <Drawer.Trigger class="mt-2">
    {@render trigger()}
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 bg-black/40" />
    <Drawer.Content 
      drawerDirection={direction}
      class={`
        fixed flex bg-slate-800 p-6 text-white
        ${direction === "bottom" && "bottom-0 left-0 right-0 h-[50%] flex-col rounded-t-[10px]"}
        ${direction === "top" && "left-0 right-0 top-0 h-[50%] flex-col rounded-b-[10px]"}
        ${direction === "left" && "bottom-0 left-0 top-0 w-[50%] flex-row rounded-r-[10px]"}
        ${direction === "right" && "bottom-0 right-0 top-0 w-[50%] flex-row rounded-l-[10px]"}
      `}
    > 
      <div class="mx-auto h-1 w-full max-w-32 rounded-full bg-slate-200"></div>
      <Drawer.Title class="text-xl font-bold">Quick Post</Drawer.Title>
      <span class="my-auto">
        {@render content()}  
      </span>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
