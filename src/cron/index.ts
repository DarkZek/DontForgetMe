import type { AstroIntegration } from "astro";

export function cron(): AstroIntegration {
    return {
        name: 'astro-cron',
        hooks: {
          'astro:server:start': async ({ runtime }) => {
            console.log('Starting cron job')
          }
        }
      }
}