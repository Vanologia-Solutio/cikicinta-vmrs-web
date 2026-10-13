/** One recurring sync job: what runs and how often. */
export interface SyncSchedule {
  id: string;
  code: string;
  platform: string;
  jobType: string;
  cronExpression: string;
  isActive: boolean;
  jobOptions: Record<string, unknown> | null;
}
