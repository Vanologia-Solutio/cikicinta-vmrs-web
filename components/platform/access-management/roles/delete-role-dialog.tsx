"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { roleQueries } from "@/hooks/use-role";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { Role } from "@/shared/types/role";

export function DeleteRoleDialog({ entity }: { entity: Role }) {
  const { mutateAsync: deleteRole, isPending: isDeleting } =
    roleQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.name.trim()) return;

    try {
      const res = await deleteRole(entity.id);
      notify.success(res?.message ?? "Role deleted successfully");
    } catch (error) {
      notify.error("Failed to delete role", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Role"
      entityName={entity.name}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
