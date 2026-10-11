import { AgentPrintJob, PrintJobStatus } from "../types/printer-agent";

/** The agent's default MAX_LABELS_PER_JOB; larger selections are split. */
export const MAX_LABELS_PER_JOB = 300;

interface JobStatusPresentation {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  /** Shown when the agent gave no detail of its own. */
  description: string;
}

export const JOB_STATUS_PRESENTATION: Record<
  PrintJobStatus,
  JobStatusPresentation
> = {
  queued: {
    label: "Queued",
    variant: "secondary",
    description: "Waiting for earlier jobs to finish.",
  },
  processing: {
    label: "Sending",
    variant: "secondary",
    description: "Being sent to the printer.",
  },
  submitted: {
    label: "Sent (final)",
    variant: "outline",
    description:
      "The printer accepted the job. Check the stickers; the agent cannot confirm they printed.",
  },
  completed: {
    label: "Printed",
    variant: "default",
    description: "The printer confirmed the stickers.",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    description: "Nothing was printed. It is safe to retry.",
  },
  unknown: {
    label: "Outcome unknown",
    variant: "destructive",
    description:
      "Some or all stickers may have printed. Check the printer before retrying.",
  },
};

export const isJobActive = (job: AgentPrintJob) =>
  job.status === "queued" || job.status === "processing";

/** Only jobs that did not (or may not) print, and were not retried already. */
export const canRetryJob = (job: AgentPrintJob) =>
  (job.status === "failed" || job.status === "unknown") && !job.retriedBy;

/** Retrying these could print duplicates, so the operator must confirm. */
export const retryNeedsConfirmation = (job: AgentPrintJob) =>
  job.status === "unknown";

const TROUBLESHOOTING: Record<string, string> = {
  agent_unreachable:
    "Check that the VMRS Printer Agent is running on this computer. It starts with Windows; if it was closed, restart the computer or start the agent again.",
  unauthorized:
    "The pairing token is missing or wrong. Paste the token from the agent's data folder again.",
  forbidden_origin:
    "This dashboard address is not in the agent's ALLOWED_ORIGINS setting.",
  printer_unavailable:
    "Windows could not reach the printer. Check the USB cable and power, and that the printer appears in Windows Printers.",
  printer_not_found:
    "The selected printer is no longer available to the agent. Pick another printer.",
  layout_does_not_fit:
    "The barcode does not fit the label with the agent's current settings.",
  printer_busy:
    "A print job is still running. Wait for it to finish, then try again.",
  calibration_not_supported:
    "The agent is set to continuous media (no sensor), so there is nothing to calibrate.",
};

export const agentTroubleshooting = (code?: string): string | undefined =>
  code ? TROUBLESHOOTING[code] : undefined;
