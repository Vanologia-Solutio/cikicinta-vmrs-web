"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { userQueries } from "@/hooks/use-user";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { User } from "@/shared/types/user";

export function DeleteUserDialog({ entity }: { entity: User }) {
  const { mutateAsync: deleteUser, isPending: isDeleting } =
    userQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.username.trim()) return;

    try {
      const res = await deleteUser(entity.id);
      notify.success(res?.message ?? "User deleted successfully");
    } catch (error) {
      notify.error("Failed to delete user", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete User"
      entityName={entity.username}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
