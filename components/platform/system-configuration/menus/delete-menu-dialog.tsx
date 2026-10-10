"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { menuQueries } from "@/hooks/use-menu";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { Menu } from "@/shared/types/menu";

export function DeleteMenuDialog({ entity }: { entity: Menu }) {
  const { mutateAsync: deleteMenu, isPending: isDeleting } =
    menuQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.title.trim()) return;

    try {
      const res = await deleteMenu(entity.id);
      notify.success(res?.message ?? "Menu deleted successfully");
    } catch (error) {
      notify.error("Failed to delete menu", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Menu"
      entityName={entity.title}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
