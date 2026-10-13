import * as z from "zod";
import { SyncSchedule } from "../types/sync-schedule";

export const syncScheduleFormSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  platform: z.string().trim().min(1, "Platform is required"),
  jobType: z.string().min(1, "Job is required"),
  // Free text; the scheduler decides whether it can run it.
  cronExpression: z.string().trim().min(1, "Cron expression is required"),
  isActive: z.boolean().default(true),
});

export type SyncScheduleFormValues = z.infer<typeof syncScheduleFormSchema>;

export const defaultSyncScheduleFormValues: SyncScheduleFormValues = {
  code: "",
  platform: "internal",
  jobType: "",
  cronExpression: "",
  isActive: true,
};

export const defaultEditSyncScheduleValues = (
  entity: SyncSchedule,
): SyncScheduleFormValues => ({
  code: entity.code,
  platform: entity.platform,
  jobType: entity.jobType,
  cronExpression: entity.cronExpression,
  isActive: entity.isActive,
});
