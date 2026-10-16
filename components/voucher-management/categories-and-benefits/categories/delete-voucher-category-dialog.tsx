"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { voucherCategoryQueries } from "@/hooks/use-voucher-category";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { VoucherCategory } from "@/shared/types/voucher-category";

export function DeleteVoucherCategoryDialog({
  entity,
}: {
  entity: VoucherCategory;
}) {
  const { mutateAsync: deleteVoucherCategory, isPending: isDeleting } =
    voucherCategoryQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.name.trim()) return;

    try {
      const res = await deleteVoucherCategory(entity.id);
      notify.success(res?.message ?? "Voucher category deleted successfully");
    } catch (error) {
      notify.error("Failed to delete voucher category", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Voucher Category"
      entityName={entity.name}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
