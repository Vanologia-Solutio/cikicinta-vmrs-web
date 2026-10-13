"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { syncScheduleQueries } from "@/hooks/use-sync-schedule";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { SyncSchedule } from "@/shared/types/sync-schedule";
import { useCanManageSyncSchedules } from "./use-can-manage-sync-schedules";

export function DeleteSyncScheduleDialog({ entity }: { entity: SyncSchedule }) {
  const canManage = useCanManageSyncSchedules();
  const { mutateAsync: deleteSyncSchedule, isPending: isDeleting } =
    syncScheduleQueries.useDelete();

  if (!canManage) return null;

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.code) return;

    try {
      const res = await deleteSyncSchedule(entity.id);
      notify.success(res?.message ?? "Sync schedule deleted successfully");
    } catch (error) {
      notify.error("Failed to delete sync schedule", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Sync Schedule"
      description="An active schedule must be deactivated before it can be deleted. This action cannot be undone."
      entityName={entity.code}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
