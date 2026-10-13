"use client";

import { Button } from "@/components/ui/button";
import { syncRouteQueries } from "@/hooks/use-sync-route";
import { errorMessage, notify } from "@/lib/toast";
import { SyncRoute } from "@/shared/types/sync-route";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useCanManageSyncRoutes } from "./use-can-manage-sync-routes";

/**
 * Switches a route on or off. Events already accepted by the hub are still
 * delivered; an inactive route only stops new ones being accepted.
 */
export function ToggleSyncRouteButton({ entity }: { entity: SyncRoute }) {
  const canManage = useCanManageSyncRoutes();
  const { mutateAsync: updateSyncRoute, isPending } =
    syncRouteQueries.useUpdate();

  if (!canManage) return null;

  const action = entity.isActive ? "Deactivate" : "Activate";

  const handleClick = async () => {
    try {
      await updateSyncRoute({ id: entity.id, isActive: !entity.isActive });
      notify.success(
        entity.isActive ? "Sync route deactivated" : "Sync route activated",
      );
    } catch (error) {
      notify.error(`Failed to ${action.toLowerCase()} the sync route`, {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`${action} this route`}
      title={action}
      disabled={isPending}
      onClick={handleClick}
    >
      {entity.isActive ? <PauseIcon /> : <PlayIcon />}
    </Button>
  );
}
