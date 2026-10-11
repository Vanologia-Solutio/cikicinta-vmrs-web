"use client";

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
import { agentTroubleshooting } from "@/shared/utils/printer-agent";
import { CrosshairIcon } from "@phosphor-icons/react";
import { useState } from "react";

/**
 * Runs the printer's own gap detection through the agent, the same thing
 * `npm run calibrate` does on the workstation. Nothing is printed.
 */
export function CalibratePrinterButton({ printerId }: { printerId?: string }) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: calibrate, isPending } =
    printerAgentQueries.useCalibratePrinter();

  const handleCalibrate = async () => {
    if (!printerId) return;
    setOpen(false);
    try {
      await calibrate(printerId);
      notify.success("Calibration sent", {
        description:
          "The printer should feed a few blank labels and stop at a gap.",
      });
    } catch (error) {
      const failure = error instanceof PrinterAgentError ? error : undefined;
      notify.error("Could not calibrate the printer", {
        description:
          agentTroubleshooting(failure?.code) ??
          failure?.message ??
          "Unexpected error.",
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={!printerId || isPending}
        onClick={() => setOpen(true)}
      >
        <CrosshairIcon />
        {isPending ? "Calibrating..." : "Calibrate gap sensor"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Calibrate the gap sensor?</AlertDialogTitle>
            <AlertDialogDescription>
              Load the label stock and make sure nothing is printing. The
              printer feeds a few blank labels to learn where the rows are, then
              stops at a gap. Nothing is printed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCalibrate}>
              Calibrate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
