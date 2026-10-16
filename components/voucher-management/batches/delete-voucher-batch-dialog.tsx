"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { VoucherBatch } from "@/shared/types/voucher-batch";

export function DeleteVoucherBatchDialog({ entity }: { entity: VoucherBatch }) {
  const { mutateAsync: deleteBatch, isPending: isDeleting } =
    voucherBatchQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.batchCode.trim()) return;

    try {
      const res = await deleteBatch(entity.id);
      notify.success(res?.message ?? "Voucher batch deleted successfully");
    } catch (error) {
      notify.error("Failed to delete voucher batch", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Voucher Batch"
      description="This also deletes every voucher in the batch."
      entityName={entity.batchCode}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
