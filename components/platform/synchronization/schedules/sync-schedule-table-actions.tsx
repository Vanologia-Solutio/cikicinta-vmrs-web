import { DeleteSyncScheduleDialog } from "./delete-sync-schedule-dialog";
import { EditSyncScheduleDialog } from "./edit-sync-schedule-dialog";
import { ToggleSyncScheduleButton } from "./toggle-sync-schedule-button";

export const SYNC_SCHEDULE_TABLE_ACTIONS = {
  toggle: ToggleSyncScheduleButton,
  edit: EditSyncScheduleDialog,
  delete: DeleteSyncScheduleDialog,
};
