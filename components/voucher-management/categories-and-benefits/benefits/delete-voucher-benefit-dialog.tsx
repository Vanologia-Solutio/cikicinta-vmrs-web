"use client";

import { DeleteEntityDialog } from "@/components/general/delete-entity-dialog";
import { voucherBenefitQueries } from "@/hooks/use-voucher-benefit";
import { errorMessage, notify } from "@/lib/toast";
import { DeleteEntityValues } from "@/shared/schemas/general";
import { VoucherBenefit } from "@/shared/types/voucher-benefit";

export function DeleteVoucherBenefitDialog({
  entity,
}: {
  entity: VoucherBenefit;
}) {
  const { mutateAsync: deleteVoucherBenefit, isPending: isDeleting } =
    voucherBenefitQueries.useDelete();

  const handleDelete = async (values: DeleteEntityValues) => {
    if (values.confirm.trim() !== entity.name.trim()) return;

    try {
      const res = await deleteVoucherBenefit(entity.id);
      notify.success(res?.message ?? "Voucher benefit deleted successfully");
    } catch (error) {
      notify.error("Failed to delete voucher benefit", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <DeleteEntityDialog
      title="Delete Voucher Benefit"
      entityName={entity.name}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
