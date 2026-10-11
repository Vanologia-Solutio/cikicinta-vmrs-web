"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { errorMessage, notify } from "@/lib/toast";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { PrintRunOutcome } from "@/shared/dtos/voucher-batch";
import {
  confirmPrintRunSchema,
  ConfirmPrintRunValues,
} from "@/shared/schemas/print-run";
import { VoucherPrintRun } from "@/shared/types/voucher-batch";
import { formatSeparator } from "@/shared/utils/formatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  LOG_STATUS_PRESENTATION,
  RUN_STATUS_PRESENTATION,
} from "./print-status";

const OUTCOMES: { value: PrintRunOutcome; label: string; hint: string }[] = [
  {
    value: "all",
    label: "All stickers printed",
    hint: "Every sticker of this run came out correctly.",
  },
  {
    value: "stopped_at",
    label: "It stopped partway",
    hint: "Count everything up to the last good sticker; the rest stays unprinted.",
  },
  {
    value: "none",
    label: "Nothing printed",
    hint: "No sticker of this run is usable; all of it stays unprinted.",
  },
];

interface PrintRunDialogProps {
  batchId: string;
  /** The run to show; the dialog is closed while this is null. */
  run: VoucherPrintRun | null;
  onClose: () => void;
}

export function PrintRunDialog({ batchId, run, onClose }: PrintRunDialogProps) {
  return (
    <Dialog open={run !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {run && (
          // Keyed by run so a different run starts with a clean form.
          <PrintRunContent
            key={run.printRunId}
            batchId={batchId}
            run={run}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PrintRunContent({
  batchId,
  run,
  onClose,
}: {
  batchId: string;
  run: VoucherPrintRun;
  onClose: () => void;
}) {
  // A run is at most a few dozen jobs, so one page holds all of them.
  const { data: jobs, isLoading } = voucherBatchQueries.usePrintLogs(
    batchId,
    DEFAULT_PAGINATION_QUERY,
    { printRunId: run.printRunId },
  );
  const { mutateAsync: confirmRun, isPending } =
    voucherBatchQueries.useConfirmPrintRun(batchId);

  const form = useForm<ConfirmPrintRunValues>({
    resolver: zodResolver(confirmPrintRunSchema),
    defaultValues: { outcome: "all", lastPrintedCode: "" },
  });
  const outcome = useWatch({ control: form.control, name: "outcome" });

  const canCheck = run.status === "awaiting_check";
  const status = RUN_STATUS_PRESENTATION[run.status];

  const handleSubmit = async (values: ConfirmPrintRunValues) => {
    try {
      const res = await confirmRun({
        printRunId: run.printRunId,
        outcome: values.outcome,
        lastPrintedCode:
          values.outcome === "stopped_at" ? values.lastPrintedCode : undefined,
      });
      const { printed, notPrinted } = res.data;
      notify.success(
        `${formatSeparator(printed)} counted as printed`,
        notPrinted > 0
          ? { description: `${formatSeparator(notPrinted)} left to print.` }
          : undefined,
      );
      onClose();
    } catch (error) {
      notify.error("Could not record the check", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Print run
          <Badge variant={status.variant}>{status.label}</Badge>
        </DialogTitle>
        <DialogDescription>
          {formatSeparator(run.quantityRequested)} stickers in {run.jobCount}{" "}
          {run.jobCount === 1 ? "job" : "jobs"}
          {run.printerName ? ` on ${run.printerName}` : ""}.{" "}
          {formatSeparator(run.quantityCompleted)} counted as printed so far.
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <SpinnerGapIcon className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Job</TableHead>
                <TableHead className="text-right">Stickers</TableHead>
                <TableHead className="text-right">Printed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(jobs?.data ?? []).map((job) => {
                const jobStatus = LOG_STATUS_PRESENTATION[job.status];
                return (
                  <TableRow key={job.id}>
                    <TableCell>{job.runSequence + 1}</TableCell>
                    <TableCell className="text-right">
                      {formatSeparator(job.quantityRequested)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatSeparator(job.quantityCompleted)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={jobStatus?.variant ?? "outline"}>
                        {jobStatus?.label ?? job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {job.errorMessage ?? "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {run.status === "in_progress" && (
        <p className="text-muted-foreground">
          This run is still being sent to the printer. Check it once every job
          has been sent.
        </p>
      )}

      {canCheck && (
        <form
          className="flex flex-col gap-4"
          autoComplete="off"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Controller
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <Field>
                <FieldLabel>What came out of the printer?</FieldLabel>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={(next) => field.onChange(next)}
                  disabled={isPending}
                >
                  {OUTCOMES.map((option) => (
                    <div key={option.value} className="flex items-start gap-2">
                      <RadioGroupItem
                        id={`print-run-outcome-${option.value}`}
                        value={option.value}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`print-run-outcome-${option.value}`}
                        className="flex flex-col items-start gap-0.5 font-normal"
                      >
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground">
                          {option.hint}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            )}
          />

          {outcome === "stopped_at" && (
            <Controller
              control={form.control}
              name="lastPrintedCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="print-run-last-code">
                    Last sticker that printed correctly
                  </FieldLabel>
                  {/* A barcode scanner types the code and presses Enter,
                      which submits the form. */}
                  <Input
                    id="print-run-last-code"
                    className="font-mono"
                    placeholder="Scan or type its code"
                    inputMode="numeric"
                    autoFocus
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <SpinnerGapIcon className="animate-spin" />}
              Record check
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  );
}
