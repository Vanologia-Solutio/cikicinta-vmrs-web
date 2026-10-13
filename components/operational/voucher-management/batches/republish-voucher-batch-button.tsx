"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { syncQueries } from "@/hooks/use-sync";
import { errorMessage, notify } from "@/lib/toast";
import { VoucherBatch } from "@/shared/types/voucher-batch";
import { PaperPlaneTiltIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useState } from "react";

/**
 * Sends a ready batch and all of its vouchers to the other sites again, for
 * when one did not fully arrive or was created before sync was switched on.
 * The receiving site skips what it already has, so this is always safe.
 */
export function RepublishVoucherBatchButton({
  entity,
}: {
  entity: VoucherBatch;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: republish, isPending } = syncQueries.useRepublishBatch();

  if (entity.status !== "ready") return null;

  const handleConfirm = async () => {
    try {
      const res = await republish(entity.id);
      const { events } = res.data;
      if (events > 0) {
        notify.success("Batch queued to be sent again", {
          description: `${events} event(s) will go out with the next sync run.`,
        });
      } else {
        notify.info("Nothing was queued", {
          description: "Synchronization is switched off at this site.",
        });
      }
      setOpen(false);
    } catch (error) {
      notify.error("Failed to send the batch again", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Send ${entity.batchCode} to other sites again`}
            title="Send to other sites again"
          />
        }
      >
        <PaperPlaneTiltIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {entity.batchCode} again?</DialogTitle>
          <DialogDescription>
            The batch and all of its vouchers are queued for the other sites.
            Vouchers a site already has are skipped, so nothing is duplicated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <Button disabled={isPending} onClick={handleConfirm}>
            {isPending ? (
              <SpinnerGapIcon className="animate-spin" />
            ) : (
              <PaperPlaneTiltIcon />
            )}
            Send again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
