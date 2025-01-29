// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';
import node from '@astrojs/node';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), vue()],

  adapter: node({
    mode: 'standalone'
  })
});