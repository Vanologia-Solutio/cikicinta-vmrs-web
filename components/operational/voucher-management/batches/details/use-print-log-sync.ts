import {
  printerAgentQueries,
  usePrinterAgentToken,
} from "@/hooks/use-printer-agent";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { VoucherPrintLog } from "@/shared/types/voucher-batch";
import { isJobPrinted } from "@/shared/utils/printer-agent";
import { useEffect, useRef } from "react";

/**
 * Keeps this batch's print logs in step with the printer agent, which is the
 * only place a job's real status is known. Every status the agent reports and
 * the log has not recorded yet is sent to the API; that is also what moves the
 * print counts once a job is accepted by the printer.
 *
 * The agent is only asked while this batch has a log that is still queued or
 * processing; with none, the page makes no agent request at all. A job that
 * finished while the page was closed is picked up on the next visit, as long
 * as the agent still has it in its history.
 */
export function usePrintLogSync(batchId: string, logs: VoucherPrintLog[]) {
  const token = usePrinterAgentToken();
  const hasJobInFlight = logs.some(
    (log) => log.status === "queued" || log.status === "processing",
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
      // A printed log is final: its stickers are already counted.
      if (!job || job.status === log.status || isJobPrinted(log.status)) {
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
          voucherIds: job.vouchers.map((voucher) => voucher.id),
        },
        // Let the next poll try again.
        { onError: () => reported.current.delete(key) },
      );
    }
  }, [jobs.data, logs, updatePrintLog]);
}
