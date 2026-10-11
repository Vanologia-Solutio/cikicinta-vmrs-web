"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  printerAgentQueries,
  usePrinterAgentToken,
} from "@/hooks/use-printer-agent";
import { notify } from "@/lib/toast";
import { PrinterAgentError } from "@/services/printer-agent-service";
import { setPrinterAgentToken } from "@/shared/helpers/printer-agent-token";
import {
  pairingTokenSchema,
  PairingTokenValues,
} from "@/shared/schemas/printer-agent";
import { AgentPrintJob, AgentVoucher } from "@/shared/types/printer-agent";
import {
  agentTroubleshooting,
  MAX_LABELS_PER_JOB,
  retryNeedsConfirmation,
} from "@/shared/utils/printer-agent";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowClockwiseIcon,
  PrinterIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Fragment, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { PrintJobList } from "./print-job-list";

interface PrinterAgentPanelProps {
  /** Selected vouchers, already ordered and de-duplicated. */
  vouchers: AgentVoucher[];
  /** Called for every job the agent accepts, including retries. */
  onJobQueued?: (job: AgentPrintJob, printerName: string) => void;
  /** Called once every job for the current vouchers has been accepted. */
  onSubmitted?: () => void;
  /** Limits the job list (and so what can be retried) to matching jobs. */
  jobFilter?: (job: AgentPrintJob) => boolean;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const agentError = (error: unknown) =>
  error instanceof PrinterAgentError ? error : undefined;

export function PrinterAgentPanel({
  vouchers,
  onJobQueued,
  onSubmitted,
  jobFilter,
}: PrinterAgentPanelProps) {
  const token = usePrinterAgentToken();
  const pairingForm = useForm<PairingTokenValues>({
    resolver: zodResolver(pairingTokenSchema),
    defaultValues: { token: "" },
  });
  const [chosenPrinterId, setChosenPrinterId] = useState<string>();
  const [reprintOpen, setReprintOpen] = useState(false);
  const [riskyRetry, setRiskyRetry] = useState<AgentPrintJob | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The agent caps the labels in one job, so a large selection goes out as
  // several consecutive jobs.
  const jobChunks = useMemo(
    () => chunk(vouchers, MAX_LABELS_PER_JOB),
    [vouchers],
  );

  // One key per job of a distinct print intent, so a double click or a resend
  // after a lost response can never queue the same stickers twice.
  const intent = useRef<{ signature: string; keys: string[] } | null>(null);

  const queryClient = useQueryClient();
  const isRefreshing =
    useIsFetching({ queryKey: printerAgentQueries.keys.all }) > 0;

  // Everything except /health was answered for the previous token. Dropping
  // it makes the agent judge the new token, instead of a cached printer list
  // making a wrong token look paired.
  const changeToken = (next: string | null) => {
    const healthKey = printerAgentQueries.keys.health().join("/");
    queryClient.removeQueries({
      queryKey: printerAgentQueries.keys.all,
      predicate: (query) => query.queryKey.join("/") !== healthKey,
    });
    setPrinterAgentToken(next);
  };

  const health = printerAgentQueries.useHealth();
  const reachable = health.isSuccess;
  const hasToken = !!token;

  const printers = printerAgentQueries.usePrinters(reachable && hasToken);
  const unauthorized = agentError(printers.error)?.code === "unauthorized";
  const paired = reachable && hasToken && printers.isSuccess;
  const isPairing = hasToken && printers.isFetching;

  const printerId =
    chosenPrinterId ??
    printers.data?.find((printer) => printer.isDefault)?.id ??
    printers.data?.[0]?.id;
  const printerItems = (printers.data ?? []).map((printer) => ({
    value: printer.id,
    label: printer.name,
  }));

  const printerStatus = printerAgentQueries.usePrinterStatus(printerId, paired);
  const jobs = printerAgentQueries.useJobs(paired);
  // The layout is the same for every job, so checking the first is enough.
  const preview = printerAgentQueries.usePreview(jobChunks[0] ?? [], paired);
  const createJob = printerAgentQueries.useCreateJob();
  const retryJob = printerAgentQueries.useRetryJob();

  const count = vouchers.length;
  const stickers = `${count} ${count === 1 ? "sticker" : "stickers"}`;
  const previewError = agentError(preview.error);
  const connectionError =
    agentError(health.error) ?? agentError(printers.error);

  const submit = async (confirmReprint: boolean) => {
    if (!printerId || count === 0) return;

    const signature = [printerId, ...vouchers.map((v) => v.id)].join("|");
    if (intent.current?.signature !== signature) {
      intent.current = {
        signature,
        keys: jobChunks.map(() => crypto.randomUUID()),
      };
    }
    const { keys } = intent.current;
    const printerName =
      printers.data?.find((printer) => printer.id === printerId)?.name ??
      printerId;

    setSubmitting(true);
    try {
      // A job already accepted in an earlier attempt answers with the same
      // job for its key, so resending the whole intent is safe.
      for (const [index, jobVouchers] of jobChunks.entries()) {
        const job = await createJob.mutateAsync({
          idempotencyKey: keys[index],
          printerId,
          vouchers: jobVouchers,
          confirmReprint: confirmReprint || undefined,
        });
        onJobQueued?.(job, printerName);
      }
      intent.current = null;
      notify.success(`${stickers} queued`, {
        description:
          jobChunks.length > 1
            ? `Sent as ${jobChunks.length} print jobs. Follow their status below.`
            : "Follow the job status below.",
      });
      onSubmitted?.();
    } catch (error) {
      const failure = agentError(error);
      if (failure?.code === "duplicate_voucher") {
        setReprintOpen(true);
        return;
      }
      notify.error("Could not queue the print job", {
        description:
          agentTroubleshooting(failure?.code) ??
          failure?.message ??
          "Unexpected error.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const retry = async (
    job: AgentPrintJob,
    acknowledgeDuplicateRisk: boolean,
  ) => {
    try {
      const retried = await retryJob.mutateAsync({
        jobId: job.id,
        acknowledgeDuplicateRisk,
      });
      onJobQueued?.(
        retried,
        printers.data?.find((printer) => printer.id === retried.printerId)
          ?.name ?? retried.printerId,
      );
      notify.success("Retry queued");
    } catch (error) {
      notify.error("Could not retry the job", {
        description: agentError(error)?.message ?? "Unexpected error.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Printer agent</CardTitle>
        <CardDescription>
          Prints straight to the label printer through the local agent.
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          {health.isPending ? (
            <Badge variant="secondary">Checking...</Badge>
          ) : reachable ? (
            <Badge variant={paired ? "default" : "outline"}>
              {paired
                ? `Connected · v${health.data.version}`
                : "Agent found, not paired"}
            </Badge>
          ) : (
            <Badge variant="destructive">Not connected</Badge>
          )}
          {printerStatus.data && (
            <Badge
              variant={
                printerStatus.data.online === false ? "destructive" : "outline"
              }
              title={printerStatus.data.detail}
            >
              {printerStatus.data.state}
              {printerStatus.data.queuedJobs
                ? ` · ${printerStatus.data.queuedJobs} in Windows queue`
                : ""}
            </Badge>
          )}
          {/* Nothing is re-read on a timer, so rechecking is explicit. */}
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Refresh printer agent status"
            title="Refresh"
            disabled={isRefreshing}
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: printerAgentQueries.keys.all,
              })
            }
          >
            <ArrowClockwiseIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {health.isError && (
          <Alert variant="destructive">
            <WarningIcon />
            <AlertTitle>Printer agent is not running</AlertTitle>
            <AlertDescription>
              {agentTroubleshooting("agent_unreachable")}
            </AlertDescription>
          </Alert>
        )}

        {reachable && connectionError && !unauthorized && (
          <Alert variant="destructive">
            <WarningIcon />
            <AlertTitle>{connectionError.message}</AlertTitle>
            <AlertDescription>
              {agentTroubleshooting(connectionError.code)}
            </AlertDescription>
          </Alert>
        )}

        {reachable && health.data.adapter === "mock" && (
          <Alert>
            <WarningIcon />
            <AlertTitle>Agent is in mock mode</AlertTitle>
            <AlertDescription>
              Jobs are accepted but nothing is printed. Set
              PRINTER_ADAPTER=windows-raw on the workstation to print.
            </AlertDescription>
          </Alert>
        )}

        {/* Stays mounted while a just-entered token is checked, so the form
            does not vanish and come back when the agent rejects it. */}
        {reachable &&
          !paired &&
          (!hasToken || unauthorized || pairingForm.formState.isSubmitted) && (
            <form
              className="flex flex-col gap-2"
              autoComplete="off"
              onSubmit={pairingForm.handleSubmit(({ token: next }) => {
                changeToken(next);
                pairingForm.reset(undefined, { keepIsSubmitted: true });
              })}
            >
              <Controller
                control={pairingForm.control}
                name="token"
                render={({ field, fieldState }) => {
                  const error =
                    fieldState.error ??
                    (unauthorized
                      ? { message: agentTroubleshooting("unauthorized") }
                      : undefined);
                  return (
                    <Field data-invalid={!!error}>
                      <FieldLabel htmlFor="printer-agent-token">
                        Pairing token
                      </FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="printer-agent-token"
                          placeholder="Paste the token from the agent once. It is stored in this browser only."
                          type="password"
                          aria-invalid={!!error}
                          disabled={isPairing}
                          {...field}
                        />
                        <Button type="submit" disabled={isPairing}>
                          {isPairing ? "Pairing…" : "Pair"}
                        </Button>
                      </div>
                      {error && <FieldError errors={[error]} />}
                    </Field>
                  );
                }}
              />
            </form>
          )}

        {paired && (
          <Fragment>
            <div className="flex flex-wrap items-end gap-3">
              <Field className="w-auto">
                <FieldLabel htmlFor="printer-agent-printer">Printer</FieldLabel>
                {/* Base UI resolves the trigger label from `items`. */}
                <Select
                  items={printerItems}
                  value={printerId ?? null}
                  onValueChange={(next) => {
                    if (next) setChosenPrinterId(next);
                  }}
                  disabled={printerItems.length === 0}
                >
                  <SelectTrigger
                    id="printer-agent-printer"
                    className="min-w-56"
                  >
                    <SelectValue placeholder="No printer available" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {printerItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Button
                className="ml-auto"
                disabled={
                  count === 0 || !printerId || submitting || !!previewError
                }
                onClick={() => submit(false)}
              >
                <PrinterIcon />
                {submitting ? "Queueing…" : `Print ${stickers}`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeToken(null)}
              >
                Unpair
              </Button>
            </div>

            {previewError && (
              <Alert variant="destructive">
                <WarningIcon />
                <AlertTitle>These stickers cannot be printed</AlertTitle>
                <AlertDescription>{previewError.message}</AlertDescription>
              </Alert>
            )}

            {count === 0 ? (
              <p className="text-muted-foreground">
                No vouchers selected for printing.
              </p>
            ) : (
              preview.data && (
                <p className="text-muted-foreground">
                  {stickers} in rows of {preview.data.label.columns}, positioned
                  by the agent ({preview.data.label.rowWidthMm} ×{" "}
                  {preview.data.label.labelHeightMm} mm per row, bar width{" "}
                  {preview.data.label.moduleMm.toFixed(3)} mm)
                  {jobChunks.length > 1 &&
                    `, sent as ${jobChunks.length} print jobs of up to ${MAX_LABELS_PER_JOB}`}
                  .
                </p>
              )
            )}

            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Print jobs</h3>
              <PrintJobList
                jobs={(jobs.data ?? []).filter(jobFilter ?? (() => true))}
                retryingJobId={
                  retryJob.isPending ? retryJob.variables?.jobId : undefined
                }
                onRetry={(job) =>
                  retryNeedsConfirmation(job)
                    ? setRiskyRetry(job)
                    : retry(job, false)
                }
              />
            </div>
          </Fragment>
        )}
      </CardContent>

      <AlertDialog open={reprintOpen} onOpenChange={setReprintOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Print these stickers again?</AlertDialogTitle>
            <AlertDialogDescription>
              Some of the selected vouchers were already sent to the printer in
              the last few minutes. Printing again will produce duplicate
              stickers for them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setReprintOpen(false);
                void submit(true);
              }}
            >
              Print duplicates
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={riskyRetry !== null}
        onOpenChange={(open) => !open && setRiskyRetry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Retry a job with an unknown outcome?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The agent cannot tell whether these {riskyRetry?.labelCount}{" "}
              stickers printed. Check the printer and the Windows print queue
              first. Retrying may print them a second time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const job = riskyRetry;
                setRiskyRetry(null);
                if (job) void retry(job, true);
              }}
            >
              Retry anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
