"use client";

import { CopyText } from "@/components/general/copy-text";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { voucherRedemptionQueries } from "@/hooks/use-voucher-redemption";
import { errorMessage } from "@/lib/toast";
import { VoucherRedemptionDetail } from "@/shared/types/voucher-redemption";
import { SpinnerGapIcon, WarningIcon } from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";

const formatDate = (date: string) => format(parseISO(date), "dd MMM yyyy");
const formatDateTime = (date: string) =>
  format(new Date(date), "dd MMM yyyy HH:mm:ss");

/** The voucher's life in order: printed, what it gives, valid when, redeemed. */
function details(detail: VoucherRedemptionDetail): [string, string][] {
  return [
    [
      "Printed at",
      detail.printedAt ? formatDateTime(detail.printedAt) : "Never printed",
    ],
    ["Category", detail.category?.name ?? "-"],
    ["Benefit", detail.benefit?.name ?? "-"],
    [
      "Valid",
      `${formatDate(detail.validFrom)} – ${
        detail.expiredAt ? formatDate(detail.expiredAt) : "No expiry"
      }`,
    ],
    ["Redeemed at", formatDateTime(detail.redeemedAt)],
    ["Redeemed by", detail.redeemedByName ?? "-"],
  ];
}

interface RedemptionDetailsDialogProps {
  /** The redemption to show; the dialog is closed while this is null. */
  redemptionId: string | null;
  /** Shown as the title while the details load. */
  voucherCode: string | null;
  onClose: () => void;
}

export function RedemptionDetailsDialog({
  redemptionId,
  voucherCode,
  onClose,
}: RedemptionDetailsDialogProps) {
  const { data, isLoading, error } =
    voucherRedemptionQueries.useDetails(redemptionId);
  const detail = data?.data;

  return (
    <Dialog
      open={redemptionId !== null}
      onOpenChange={(next) => !next && onClose()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">
            {detail?.voucherCode ?? voucherCode}
          </DialogTitle>
          {/* A div, not the default p: CopyText renders a div. */}
          <DialogDescription
            render={<div />}
            className="flex items-center gap-1"
          >
            {detail ? (
              <>
                Batch
                <CopyText text={detail.batchCode} textClassName="font-mono" />
              </>
            ) : (
              "Voucher details"
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <SpinnerGapIcon className="size-8 animate-spin" />
          </div>
        ) : detail ? (
          <dl className="flex flex-col gap-y-2">
            {details(detail).map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 not-last:border-b py-1"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Alert variant="destructive">
            <WarningIcon />
            <AlertTitle>Details not available</AlertTitle>
            <AlertDescription>
              {error
                ? errorMessage(error)
                : "The redemption could not be found."}
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
