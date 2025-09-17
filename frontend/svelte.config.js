import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: [vitePreprocess()],
  kit: {
    alias: {
      $components: 'src/lib/components',
      $lib: 'src/lib'
    }
  }
};

export default config;
