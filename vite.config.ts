import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vite as vidstack } from "vidstack/plugins";

export default defineConfig({
	plugins: [vidstack(), sveltekit()]
});
