"use client";

import { Button } from "@/components/ui/button";
import { syncScheduleQueries } from "@/hooks/use-sync-schedule";
import { errorMessage, notify } from "@/lib/toast";
import { SyncSchedule } from "@/shared/types/sync-schedule";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useCanManageSyncSchedules } from "./use-can-manage-sync-schedules";

/**
 * Switches a schedule on or off. The site that takes the request applies it
 * at once; the other sites follow within a minute.
 */
export function ToggleSyncScheduleButton({ entity }: { entity: SyncSchedule }) {
  const canManage = useCanManageSyncSchedules();
  const { mutateAsync: updateSyncSchedule, isPending } =
    syncScheduleQueries.useUpdate();

  if (!canManage) return null;

  const action = entity.isActive ? "Deactivate" : "Activate";

  const handleClick = async () => {
    try {
      await updateSyncSchedule({ id: entity.id, isActive: !entity.isActive });
      notify.success(
        entity.isActive
          ? "Sync schedule deactivated"
          : "Sync schedule activated",
      );
    } catch (error) {
      notify.error(`Failed to ${action.toLowerCase()} the sync schedule`, {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`${action} ${entity.code}`}
      title={action}
      disabled={isPending}
      onClick={handleClick}
    >
      {entity.isActive ? <PauseIcon /> : <PlayIcon />}
    </Button>
  );
}
