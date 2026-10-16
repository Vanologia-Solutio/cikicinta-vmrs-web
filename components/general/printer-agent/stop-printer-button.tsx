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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { printerAgentQueries } from "@/hooks/use-printer-agent";
import { notify } from "@/lib/toast";
import { PrinterAgentError } from "@/services/printer-agent-service";
import { AgentStopResult } from "@/shared/types/printer-agent";
import {
  agentTroubleshooting,
  lastSentJob,
} from "@/shared/utils/printer-agent";
import { StopCircleIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Fragment, useState } from "react";

/**
 * For when the labels run out mid-job. By then the unprinted rows sit in the
 * printer's own memory, so pressing FEED on a new roll would print them before
 * the printer has found the new gaps. This clears the agent's jobs, the
 * Windows queue and the printer, and locks it until it is calibrated.
 */
export function StopPrinterButton({
  printerId,
  onStopped,
  className,
}: {
  printerId?: string;
  className?: string;
  /** The steps left for the operator depend on what could be cleared. */
  onStopped?: (result: AgentStopResult) => void;
}) {
  const [open, setOpen] = useState(false);
  const [markLastJob, setMarkLastJob] = useState(true);
  // Read when the dialog opens, so the job on the printer can be named.
  const jobs = printerAgentQueries.useJobs(open);
  const { mutateAsync: stop, isPending } = printerAgentQueries.useStopPrinter();

  const lastJob = printerId
    ? lastSentJob(jobs.data ?? [], printerId)
    : undefined;

  const handleStop = async () => {
    if (!printerId) return;
    setOpen(false);
    try {
      const result = await stop({
        printerId,
        jobId: markLastJob ? lastJob?.id : undefined,
      });
      onStopped?.(result);
    } catch (error) {
      const failure = error instanceof PrinterAgentError ? error : undefined;
      notify.error("Could not stop the printer", {
        description: `${
          agentTroubleshooting(failure?.code) ??
          failure?.message ??
          "Unexpected error."
        } Switch the printer off and do not press FEED.`,
      });
    }
  };

  return (
    <Fragment>
      <Button
        variant="destructive"
        className={className}
        disabled={!printerId || isPending}
        onClick={() => {
          setMarkLastJob(true);
          setOpen(true);
        }}
      >
        <StopCircleIcon />
        {isPending ? "Stopping..." : "Stop & clear printer"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Stop printing and clear the printer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Use this when the labels run out mid-job. Do not press FEED.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ol className="text-muted-foreground list-decimal space-y-1 pl-3.5 text-xs">
            <li>
              Jobs waiting in the agent are cancelled; nothing of them prints.
            </li>
            <li>VMRS jobs in the Windows print queue are deleted.</li>
            <li>The printer is reset so it forgets the rows it still holds.</li>
            <li>
              Printing stays blocked until the gap sensor is calibrated on the
              new roll.
            </li>
          </ol>
          {lastJob && (
            <Field orientation="horizontal">
              <Checkbox
                id="stop-mark-last-job"
                checked={markLastJob}
                onCheckedChange={(checked) => setMarkLastJob(checked)}
              />
              <FieldLabel htmlFor="stop-mark-last-job" className="font-normal">
                Mark the last job sent as stopped part&minus;way
              </FieldLabel>
            </Field>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleStop}>
              Stop & clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}
