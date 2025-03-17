<script lang="ts">
  import { Select } from "bits-ui";
  import { getContext, onDestroy, type Snippet } from "svelte";
  import Icon from "@iconify/svelte";
  import { fly } from "svelte/transition";
  import FeedReader from "$lib/components/FeedReader.svelte";

  let { data } = $props();
  let user = data.user;
  let pinnedFeeds = data.pinnedFeeds;

  let selectedFeed = $state(user ? 
    { value: "following", label: "Following" } 
    : { value: "discovery", label: "Discovery" }
  );
  let setBottomControls = getContext("setBottomControls") as (snippet: Snippet) => void;
  let deleteBottomControl = getContext("deleteBottomControl") as (snippet: Snippet) => void;
  setBottomControls(feedSelector);

  onDestroy(() => deleteBottomControl(feedSelector));
</script>

{#snippet feedSelector()}
  <Select.Root items={pinnedFeeds} bind:selected={selectedFeed}>
    <Select.Trigger
      class="inline-flex h-input py-2 w-48 justify-between items-center rounded-lg border border-border-input bg-background px-[11px] text-sm transition-colors placeholder:text-foreground-alt/50  focus:outline-hidden focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Select a feed"
    >
      <Select.Value class="text-sm" placeholder="Select a feed" />
      <Icon icon="uil:angle-down" />
    </Select.Trigger>
    <Select.Content
      class="z-50 w-full rounded-xl border border-white bg-white px-1 py-3 shadow-popover outline-hidden"
      transition={fly}
      sideOffset={8}
    >
      {#each pinnedFeeds as feed}
        <Select.Item
          class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-hidden transition-all duration-75 data-highlighted:bg-neutral-200 rounded-lg"
          value={feed.value}
          label={feed.label}
        >
          {feed.label}
          <Select.ItemIndicator class="ml-auto" asChild={false}>
            <Icon icon="uil:check" />
          </Select.ItemIndicator>
        </Select.Item>
      {/each}
    </Select.Content>
    <Select.Input name="favoriteFruit" />
  </Select.Root>
{/snippet}

<div class="h-screen">
  <FeedReader feedUri={selectedFeed.value} />
</div>
