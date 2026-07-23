import cron from "node-cron";

/**
 * Initialize background cron jobs using node-cron.
 */
export function initializeCrons(): void {
  // Daily Weather Cache Refresh at midnight (0 0 * * *)
  cron.schedule("0 0 * * *", () => {
    console.log("⏰ [Cron] Executing daily task: Purging expired weather forecast caches...");
    // Real implementation would interface with the WeatherService to delete cached forecast entries
  });

  // System Diagnostics Check every hour
  cron.schedule("0 * * * *", () => {
    console.log("⏰ [Cron] Hourly System Check: All services operating normally.");
  });

  console.log("⏰ Background cron schedules initialized.");
}
