"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { moduleQueries } from "@/hooks/use-module";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { PlatformModule } from "@/shared/types/module";

export function DeleteModuleDialog({ entity }: { entity: PlatformModule }) {
  const { mutateAsync: deleteModule, isPending: isDeleting } =
    moduleQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.name.trim()) return;

    try {
      const res = await deleteModule(entity.id);
      notify.success(res?.message ?? "Module deleted successfully");
    } catch (error) {
      notify.error("Failed to delete module", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Module"
      entityName={entity.name}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
