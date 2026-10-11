import {
  printerAgentQueries,
  usePrinterAgentToken,
} from "@/hooks/use-printer-agent";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import {
  VoucherPrintLog,
  VoucherPrintLogStatus,
} from "@/shared/types/voucher-batch";
import { useEffect, useRef } from "react";

const DECIDED = new Set<VoucherPrintLogStatus>([
  "completed",
  "partial",
  "rejected",
]);

/**
 * Keeps this batch's print logs in step with the printer agent, which is the
 * only place a job's real status is known. Every status the agent reports and
 * the log has not recorded yet is sent to the API. Being sent to the printer
 * counts nothing: that waits for the operator's check of the run.
 *
 * The agent is only asked while this batch has a log that is still queued,
 * processing or unknown; with none, the page makes no agent request at all. A job that
 * finished while the page was closed is picked up on the next visit, as long
 * as the agent still has it in its history.
 */
export function usePrintLogSync(batchId: string, logs: VoucherPrintLog[]) {
  const token = usePrinterAgentToken();
  // `unknown` counts too: a job held up by a paused printer is corrected by
  // the agent once it goes through, and the log should follow.
  const hasJobInFlight = logs.some(
    (log) =>
      log.status === "queued" ||
      log.status === "processing" ||
      log.status === "unknown",
  );
  const jobs = printerAgentQueries.useJobs(!!token && hasJobInFlight);
  const { mutate: updatePrintLog } =
    voucherBatchQueries.useUpdatePrintLog(batchId);

  // Statuses already reported, so a poll does not send them again.
  const reported = useRef(new Set<string>());

  useEffect(() => {
    if (!jobs.data) return;
    const jobById = new Map(jobs.data.map((job) => [job.id, job]));

    for (const log of logs) {
      const job = jobById.get(log.printJobId);
      // The operator's decision on a job is final; the agent cannot undo it.
      if (!job || job.status === log.status || DECIDED.has(log.status)) {
        continue;
      }

      const key = `${job.id}:${job.status}`;
      if (reported.current.has(key)) continue;
      reported.current.add(key);

      updatePrintLog(
        {
          printJobId: job.id,
          status: job.status,
          errorMessage: job.error ?? undefined,
        },
        // Let the next poll try again.
        { onError: () => reported.current.delete(key) },
      );
    }
  }, [jobs.data, logs, updatePrintLog]);
}
