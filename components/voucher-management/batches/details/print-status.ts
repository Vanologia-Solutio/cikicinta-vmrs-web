import {
  VoucherPrintLogStatus,
  VoucherPrintRunStatus,
} from "@/shared/types/voucher-batch";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

interface StatusPresentation {
  label: string;
  variant: BadgeVariant;
}

/** How a print run reads to the operator. */
export const RUN_STATUS_PRESENTATION: Record<
  VoucherPrintRunStatus,
  StatusPresentation
> = {
  in_progress: { label: "Printing", variant: "secondary" },
  awaiting_check: { label: "Awaiting check", variant: "outline" },
  printed: { label: "Printed", variant: "default" },
  partly_printed: { label: "Partly printed", variant: "secondary" },
  not_printed: { label: "Not printed", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
};

/**
 * How one job of a run reads in the log. "Sent" is not "printed": only the
 * operator's check turns a sent job into a printed one.
 */
export const LOG_STATUS_PRESENTATION: Record<
  VoucherPrintLogStatus,
  StatusPresentation
> = {
  queued: { label: "Queued", variant: "secondary" },
  processing: { label: "Sending", variant: "secondary" },
  submitted: { label: "Sent, awaiting check", variant: "outline" },
  unknown: { label: "Unclear, awaiting check", variant: "outline" },
  completed: { label: "Printed", variant: "default" },
  partial: { label: "Partly printed", variant: "secondary" },
  rejected: { label: "Not printed", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
};
