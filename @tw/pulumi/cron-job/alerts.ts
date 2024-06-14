import { createLogBasedAlert } from '../monitoring/alerts';

export function createCronJobAlert(name: string) {
  createLogBasedAlert({
    name: name,
    sendEverySeconds: 3600,
    slack: true,
    logSearch: `resource.type="cloud_scheduler_job" severity>=ERROR resource.labels.job_id="${name}"`,
    displayName: `Cron job ${name} failed`,
  });
}
