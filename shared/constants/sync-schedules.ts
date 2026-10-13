/**
 * The jobs a schedule can run. Mirrors `SyncJobNames` in the API, which is
 * also what the sync queue has handlers for; the two must change together.
 */
export const SYNC_JOB_TYPE_OPTIONS = [
  { value: "sync.publish", label: "Publish" },
  { value: "sync.pull", label: "Pull" },
  { value: "sync.cleanup", label: "Cleanup" },
];

const LABELS: Record<string, string> = Object.fromEntries(
  SYNC_JOB_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

/** Readable name of a job type; an unknown one is shown as it is. */
export const syncJobTypeLabel = (jobType: string) => LABELS[jobType] ?? jobType;
