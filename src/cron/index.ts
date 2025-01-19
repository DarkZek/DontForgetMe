import type { AstroIntegration } from "astro"
import { notify } from "./jobs/notify"
import "../service/backend/firebase"

const jobs = [
  {
    interval: 1000 * 6,
    job: notify
  }
]

export function cron(): AstroIntegration {
  return {
    name: 'astro-cron',
    hooks: {
      'astro:server:setup': async ({ server }) => {       
        for (const { interval, job } of jobs) {
          console.log(`Starting job with interval ${interval}`)
          job()
          setInterval(() => job(), interval)
        }
      }
    }
  }
}