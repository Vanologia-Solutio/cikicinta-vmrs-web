"use client";

import { CalibratePrinterButton } from "@/components/operational/printer-configuration/calibrate-printer-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { printerAgentQueries } from "@/hooks/use-printer-agent";
import { notify } from "@/lib/toast";
import { PrinterAgentError } from "@/services/printer-agent-service";
import { AgentStopResult } from "@/shared/types/printer-agent";
import { WarningIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";

interface CalibrationLockAlertProps {
  printerId: string;
  lockedSince: string | null;
  /** The stop that caused the lock, if it happened in this browser. */
  stop?: AgentStopResult;
}

/**
 * Shown while the agent refuses to print on a printer until it is calibrated,
 * with the steps that remain and the ways to lift the lock.
 */
export function CalibrationLockAlert({
  printerId,
  lockedSince,
  stop,
}: CalibrationLockAlertProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutateAsync: confirm, isPending } =
    printerAgentQueries.useConfirmCalibration();
  const mayHavePrinted = stop?.cancelledJobs.some((job) => job.mayHavePrinted);

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      await confirm(printerId);
      notify.success("Printer unlocked");
    } catch (error) {
      notify.error("Could not unlock the printer", {
        description:
          error instanceof PrinterAgentError
            ? error.message
            : "Unexpected error.",
      });
    }
  };

  return (
    <Alert variant="destructive">
      <WarningIcon />
      <AlertTitle>
        Printing is stopped until the printer is calibrated
        {lockedSince && ` (since ${format(new Date(lockedSince), "HH:mm")})`}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        {stop && stop.problems.length > 0 && (
          <ul className="list-disc pl-5">
            {stop.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        )}
        <ol className="list-decimal space-y-1 pl-5">
          <li>Do not press FEED.</li>
          <li>
            {stop?.powerCycleAdvised
              ? "Switch the printer OFF for 10 seconds, then ON. Its memory could not be cleared from here."
              : "If FEED or switching on still prints old stickers, switch the printer off and on again."}
            {stop?.removedJobs === null &&
              " Also clear the queue in Windows: Printers & scanners → the printer → Open print queue."}
          </li>
          <li>Load the new label roll and close the print head.</li>
          <li>Calibrate the gap sensor, then test-print one row.</li>
          {(mayHavePrinted ?? true) && (
            <li>
              Check which stickers printed, record the stopped job on the batch
              page, and print only the missing vouchers again.
            </li>
          )}
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          <CalibratePrinterButton printerId={printerId} />
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            I calibrated on the printer
          </Button>
        </div>
      </AlertDescription>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unlock without calibrating here?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Only if the printer was calibrated on the device itself (for
              example by holding FEED while switching it on) with the new roll
              loaded. Printing on an uncalibrated roll puts barcodes across the
              gaps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              It is calibrated
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Alert>
  );
}
