// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';
import node from '@astrojs/node';
import { cron } from './src/cron';

// https://astro.build/config
export default defineConfig({
  integrations: [
    icon(),
    cron()
  ],

  adapter: node({
    mode: 'standalone'
  })
});