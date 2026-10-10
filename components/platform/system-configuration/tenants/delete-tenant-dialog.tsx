"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { tenantQueries } from "@/hooks/use-tenant";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { Tenant } from "@/shared/types/tenant";

export function DeleteTenantDialog({ entity }: { entity: Tenant }) {
  const { mutateAsync: deleteTenant, isPending: isDeleting } =
    tenantQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.name.trim()) return;

    try {
      const res = await deleteTenant(entity.id);
      notify.success(res?.message ?? "Tenant deleted successfully");
    } catch (error) {
      notify.error("Failed to delete tenant", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Tenant"
      entityName={entity.name}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
