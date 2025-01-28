import { notify } from "./jobs/notify"

const jobs = [
  {
    interval: 1000 * 60,
    job: notify
  }
]

export function startCron() {
  for (const { interval, job } of jobs) {
    console.log(`Starting job ${job.name} with interval ${interval}`)
    job()
    setInterval(() => job(), interval)
  }
}