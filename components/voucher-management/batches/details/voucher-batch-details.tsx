"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { PageHeader } from "@/components/general/page-header";
import { PrinterAgentPanel } from "@/components/general/printer-agent/printer-agent-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { errorMessage, notify } from "@/lib/toast";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { PrintSelectionDto } from "@/shared/dtos/voucher-batch";
import {
  AgentPrintJob,
  AgentVoucher,
  PrintJobRun,
} from "@/shared/types/printer-agent";
import { formatSeparator } from "@/shared/utils/formatter";
import {
  ArrowLeftIcon,
  SpinnerGapIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { RowSelectionState } from "@tanstack/react-table";
import Link from "next/link";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { EditVoucherBatchDialog } from "../edit-voucher-batch-dialog";
import { RegenerateVoucherBatchButton } from "../regenerate-voucher-batch-button";
import { VoucherBatchStatusBadge } from "../voucher-batch-status-badge";
import { BATCHES_PATH, formatBatchDate } from "../voucher-batches-table";
import { BatchPrintRunsTable } from "./batch-print-runs-table";
import { BatchVouchersTable } from "./batch-vouchers-table";
import { usePrintLogSync } from "./use-print-log-sync";

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export function VoucherBatchDetails({ id }: { id: string }) {
  const { data, isLoading, error } = voucherBatchQueries.useDetails(id);
  const batch = data?.data;

  // The latest logs: the ones whose jobs can still be in flight on the agent.
  const { data: recentLogs } = voucherBatchQueries.usePrintLogs(
    id,
    DEFAULT_PAGINATION_QUERY,
  );
  const logs = useMemo(() => recentLogs?.data ?? [], [recentLogs]);
  usePrintLogSync(id, logs);

  // Sent runs count nothing until the operator has checked the stickers.
  const { data: recentRuns } = voucherBatchQueries.usePrintRuns(
    id,
    DEFAULT_PAGINATION_QUERY,
  );
  const runsAwaitingCheck =
    recentRuns?.data.filter((run) => run.status === "awaiting_check").length ??
    0;
  const [tab, setTab] = useState("vouchers");

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  /** Vouchers staged for the printer agent panel. */
  const [staged, setStaged] = useState<AgentVoucher[]>([]);
  // The printer agent is only contacted while this dialog is open.
  const [printerOpen, setPrinterOpen] = useState(false);

  const printSelection = voucherBatchQueries.usePrintSelection(id);
  const { mutate: createPrintLog } = voucherBatchQueries.useCreatePrintLog(id);

  const stage = async (selection: PrintSelectionDto) => {
    try {
      const res = await printSelection.mutateAsync(selection);
      if (res.data.length === 0) {
        notify.error("Nothing to print", {
          description:
            selection.scope === "unprinted"
              ? "Every voucher in this batch has already been printed."
              : "No printable vouchers matched.",
        });
        return;
      }
      setStaged(res.data);
      setPrinterOpen(true);
    } catch (err) {
      notify.error("Could not prepare the vouchers", {
        description: errorMessage(err),
      });
    }
  };

  const handleJobQueued = useCallback(
    (job: AgentPrintJob, printerName: string, run: PrintJobRun) => {
      createPrintLog(
        {
          printJobId: job.id,
          printRunId: run.runId,
          runSequence: run.sequence,
          retryOfPrintJobId: run.retryOf,
          printerName,
          // Print order, which the run check relies on.
          voucherIds: job.vouchers.map((voucher) => voucher.id),
        },
        {
          onError: (err) =>
            notify.error("The print job was sent but could not be logged", {
              description: errorMessage(err),
            }),
        },
      );
    },
    [createPrintLog],
  );

  // The agent's job list covers every batch; only this batch's jobs belong here.
  const batchJobIds = useMemo(
    () => new Set(logs.map((log) => log.printJobId)),
    [logs],
  );
  const isBatchJob = useCallback(
    (job: AgentPrintJob) => batchJobIds.has(job.id),
    [batchJobIds],
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <SpinnerGapIcon className="size-10 animate-spin" />
      </div>
    );
  }

  if (!batch) {
    return (
      <Alert variant="destructive">
        <WarningIcon />
        <AlertTitle>Voucher batch not available</AlertTitle>
        <AlertDescription>
          {error ? errorMessage(error) : "The batch could not be found."}
        </AlertDescription>
      </Alert>
    );
  }

  const canPrint = batch.status === "ready" && batch.isActive;

  return (
    <div>
      <PageHeader
        title={batch.batchCode}
        description={`${batch.category?.name ?? "Unknown category"} - ${batch.benefit?.name ?? "Unknown benefit"}`}
        actions={
          <div className="flex items-center gap-2">
            <RegenerateVoucherBatchButton entity={batch} />
            <EditVoucherBatchDialog entity={batch} />
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={BATCHES_PATH} />}
            >
              <ArrowLeftIcon />
              All batches
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Status">
            <VoucherBatchStatusBadge status={batch.status} />
          </Stat>
          <Stat label="Vouchers">
            {batch.status === "ready"
              ? formatSeparator(batch.quantity)
              : `${formatSeparator(batch.generatedCount)} of ${formatSeparator(batch.quantity)}`}
          </Stat>
          <Stat label="Stickers printed">
            {formatSeparator(batch.printCount)}
          </Stat>
          <Stat label="Valid from">{formatBatchDate(batch.validFrom)}</Stat>
          <Stat label="Expires">{formatBatchDate(batch.expiredAt)}</Stat>
          <Stat label="Active">
            <BooleanBadge value={batch.isActive} />
          </Stat>
          {batch.notes && (
            <div className="col-span-full">
              <Stat label="Notes">{batch.notes}</Stat>
            </div>
          )}
        </CardContent>
      </Card>

      {batch.status === "generating" && (
        <Alert>
          <SpinnerGapIcon className="animate-spin" />
          <AlertTitle>Generating vouchers</AlertTitle>
          <AlertDescription>
            The vouchers appear here once all of them have been generated.
          </AlertDescription>
        </Alert>
      )}

      {batch.status === "failed" && (
        <Alert variant="destructive">
          <WarningIcon />
          <AlertTitle>Voucher generation failed</AlertTitle>
          <AlertDescription>
            {formatSeparator(batch.generatedCount)} of{" "}
            {formatSeparator(batch.quantity)} vouchers were generated. Retry to
            generate the rest; nothing can be printed until then.
          </AlertDescription>
        </Alert>
      )}

      {batch.status === "ready" && (
        <div className="space-y-4">
          {!batch.isActive && (
            <Alert>
              <WarningIcon />
              <AlertTitle>This batch is inactive</AlertTitle>
              <AlertDescription>
                Activate it to print its vouchers.
              </AlertDescription>
            </Alert>
          )}

          {runsAwaitingCheck > 0 && (
            <Alert>
              <WarningIcon />
              <AlertTitle>
                {runsAwaitingCheck === 1
                  ? "1 print run is waiting for your check"
                  : `${runsAwaitingCheck} print runs are waiting for your check`}
              </AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-2">
                Stickers are only counted as printed once you have checked them.
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTab("print-logs")}
                >
                  Check now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={tab} onValueChange={(next) => setTab(String(next))}>
            <TabsList>
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="print-logs">Print logs</TabsTrigger>
            </TabsList>
            <TabsContent value="vouchers">
              <BatchVouchersTable
                batchId={id}
                canPrint={canPrint}
                isPreparing={printSelection.isPending}
                onPrint={stage}
                onOpenPrinter={() => setPrinterOpen(true)}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
              />
            </TabsContent>
            <TabsContent value="print-logs">
              <BatchPrintRunsTable batchId={id} />
            </TabsContent>
          </Tabs>

          <Dialog
            open={printerOpen}
            onOpenChange={(next) => {
              setPrinterOpen(next);
              if (!next) setStaged([]);
            }}
          >
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Print stickers</DialogTitle>
                <DialogDescription>
                  {staged.length > 0
                    ? `${formatSeparator(staged.length)} vouchers from ${batch.batchCode} are ready to send to the printer.`
                    : `Print jobs for ${batch.batchCode}.`}
                </DialogDescription>
              </DialogHeader>
              {/* Mounted only while open: closing it stops every agent call. */}
              {printerOpen && (
                <PrinterAgentPanel
                  vouchers={staged}
                  onJobQueued={handleJobQueued}
                  onSubmitted={() => {
                    setStaged([]);
                    setRowSelection({});
                  }}
                  jobFilter={isBatchJob}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
