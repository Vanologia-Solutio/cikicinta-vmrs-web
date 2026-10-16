"use client";

import { Button } from "@/components/ui/button";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { errorMessage, notify } from "@/lib/toast";
import { VoucherBatch } from "@/shared/types/voucher-batch";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

/** Only shown for a batch whose generation failed. */
export function RegenerateVoucherBatchButton({
  entity,
}: {
  entity: VoucherBatch;
}) {
  const { mutateAsync: regenerate, isPending } =
    voucherBatchQueries.useRegenerate();

  if (entity.status !== "failed") return null;

  const handleClick = async () => {
    try {
      const res = await regenerate(entity.id);
      notify.success(res.message ?? "Voucher generation queued again");
    } catch (error) {
      notify.error("Failed to retry generation", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`Retry generation for ${entity.batchCode}`}
      title="Retry generation"
      disabled={isPending}
      onClick={handleClick}
    >
      <ArrowClockwiseIcon />
    </Button>
  );
}
