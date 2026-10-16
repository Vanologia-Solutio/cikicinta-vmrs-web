import { Badge } from "@/components/ui/badge";
import { VoucherBatchStatus } from "@/shared/types/voucher-batch";
import { SpinnerGapIcon } from "@phosphor-icons/react";

const STATUS_PRESENTATION: Record<
  VoucherBatchStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  generating: { label: "Generating", variant: "secondary" },
  ready: { label: "Ready", variant: "default" },
  failed: { label: "Generation failed", variant: "destructive" },
};

export function VoucherBatchStatusBadge({
  status,
}: {
  status: VoucherBatchStatus;
}) {
  const presentation = STATUS_PRESENTATION[status];
  return (
    <Badge variant={presentation.variant}>
      {status === "generating" && <SpinnerGapIcon className="animate-spin" />}
      {presentation.label}
    </Badge>
  );
}
