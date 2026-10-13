import { BaseEntityWithId } from "./general";
import { PrintJobStatus } from "./printer-agent";

/**
 * `receiving` only occurs at a site the batch was sent to: the batch has
 * arrived but not all of its vouchers yet.
 */
export type VoucherBatchStatus =
  "generating" | "receiving" | "ready" | "failed";

interface NamedRef {
  id: string;
  name: string;
}

export interface VoucherBatch extends BaseEntityWithId {
  tenantId: string;
  batchCode: string;
  categoryId: string;
  benefitId: string;
  category: NamedRef | null;
  benefit: NamedRef | null;
  /** Numeric columns arrive as strings. */
  quantity: string;
  status: VoucherBatchStatus;
  /** Dates are yyyy-MM-dd. */
  validFrom: string;
  expiredAt: string | null;
  notes: string | null;
  isActive: boolean;
  /** Stickers the printer accepted for this batch, reprints included. */
  printCount: string;
}

export interface VoucherBatchDetail extends VoucherBatch {
  /** Vouchers generated so far; equals quantity once the batch is ready. */
  generatedCount: number;
}

export interface Voucher extends BaseEntityWithId {
  code: string;
  status: string;
  isActive: boolean;
  printCount: string;
  lastPrintedAt: string | null;
}

/**
 * The agent's statuses, plus the two only the operator's check can produce:
 * `partial` (the job a run stopped in) and `rejected` (did not print).
 */
export type VoucherPrintLogStatus = PrintJobStatus | "partial" | "rejected";

export interface VoucherPrintLog {
  id: string;
  /** The printer agent's job id. */
  printJobId: string;
  /** Shared by every job of one print action. */
  printRunId: string;
  runSequence: number;
  requestedBy: string | null;
  printerName: string | null;
  quantityRequested: string;
  quantityCompleted: string;
  status: VoucherPrintLogStatus;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export type VoucherPrintRunStatus =
  | "in_progress"
  | "awaiting_check"
  | "printed"
  | "partly_printed"
  | "not_printed"
  | "failed";

/** One print action: every job the agent was given for it. */
export interface VoucherPrintRun {
  printRunId: string;
  createdAt: string;
  completedAt: string | null;
  printerName: string | null;
  jobCount: number;
  quantityRequested: number;
  /** Stickers the operator confirmed as printed. */
  quantityCompleted: number;
  status: VoucherPrintRunStatus;
}

export type VoucherPrintedFilter = "all" | "printed" | "unprinted";
