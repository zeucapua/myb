import { outerWidth } from "svelte/reactivity/window";
import { DISCOVERY_FEED_ITEM, FOLLOWING_FEED_ITEM } from "./utils";

export let isMobile = () => (outerWidth.current ?? 0) < 640;

// Browser + Local Storage
const browser_exists = (typeof window !== "undefined") && (typeof (document) !== "undefined");
const storage = browser_exists ? localStorage : null;

// Generalized Local Storage
export function persisted<T>(key: string, default_value: T) {
  let value: T = $state(default_value);

  const initial_local = storage?.getItem(key);
  if (initial_local) {
      value = JSON.parse(initial_local).value as T;
      if (!value) { update(); }
  }
  else {
    value = default_value;
    update();
  }

  function update() {
    if (browser_exists) {
      storage?.setItem(key, JSON.stringify({ value: value }));
    }
  }

  return {
    get value() { return value; },
    set value(new_value) { value = new_value; update(); },
    update
  }
}

export const feedReaders = persisted<{ value: string, label: string }[]>(
	"feedReaders",
	[DISCOVERY_FEED_ITEM, FOLLOWING_FEED_ITEM]
);
