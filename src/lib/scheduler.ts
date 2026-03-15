import cron from 'node-cron';

let schedulerTask: cron.ScheduledTask | null = null;

export function startScheduler(cronExpression = '0 */6 * * *') {
  // Default: every 6 hours
  if (schedulerTask) {
    console.log('Scheduler already running');
    return;
  }

  schedulerTask = cron.schedule(cronExpression, async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled scrape...`);

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scrape`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Scrape complete:`, data.message);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled scrape failed:`, error);
    }
  });

  console.log(`Scheduler started with cron: ${cronExpression}`);
}

export function stopScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('Scheduler stopped');
  }
}

export function isSchedulerRunning() {
  return schedulerTask !== null;
}
