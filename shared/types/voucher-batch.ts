import { BaseEntityWithId } from "./general";
import { PrintJobStatus } from "./printer-agent";

export type VoucherBatchStatus = "generating" | "ready" | "failed";

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

export interface VoucherPrintLog {
  id: string;
  /** The printer agent's job id. */
  printJobId: string;
  requestedBy: string | null;
  printerName: string | null;
  quantityRequested: string;
  quantityCompleted: string;
  status: PrintJobStatus;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export type VoucherPrintedFilter = "all" | "printed" | "unprinted";
