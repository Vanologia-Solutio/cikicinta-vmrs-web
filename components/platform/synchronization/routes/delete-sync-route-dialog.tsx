"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { syncRouteQueries } from "@/hooks/use-sync-route";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { SyncRoute } from "@/shared/types/sync-route";
import { useCanManageSyncRoutes } from "./use-can-manage-sync-routes";

export function DeleteSyncRouteDialog({ entity }: { entity: SyncRoute }) {
  const canManage = useCanManageSyncRoutes();
  const { mutateAsync: deleteSyncRoute, isPending: isDeleting } =
    syncRouteQueries.useDelete();

  if (!canManage) return null;

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.eventType) return;

    try {
      const res = await deleteSyncRoute(entity.id);
      notify.success(res?.message ?? "Sync route deleted successfully");
    } catch (error) {
      notify.error("Failed to delete sync route", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Sync Route"
      description="An active route must be deactivated before it can be deleted. This action cannot be undone."
      entityName={entity.eventType}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
