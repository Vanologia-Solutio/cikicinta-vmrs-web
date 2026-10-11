import { PrintJobStatus } from "../types/printer-agent";

export interface CreateVoucherBatchDto {
  categoryId: string;
  benefitId: string;
  quantity: number;
  validFrom: string;
  expiredAt?: string;
  notes?: string;
}

export interface UpdateVoucherBatchDto {
  id: string;
  validFrom: string;
  expiredAt?: string;
  notes?: string;
  isActive: boolean;
}

export type PrintSelectionDto =
  { scope: "all" | "unprinted" } | { scope: "selected"; voucherIds: string[] };

export interface CreatePrintLogDto {
  printJobId: string;
  printRunId?: string;
  runSequence?: number;
  retryOfPrintJobId?: string;
  printerName?: string;
  /** In print order. */
  voucherIds: string[];
}

export interface UpdatePrintLogDto {
  printJobId: string;
  status: PrintJobStatus;
  errorMessage?: string;
}

export type PrintRunOutcome = "all" | "none" | "stopped_at";

export interface ConfirmPrintRunDto {
  printRunId: string;
  outcome: PrintRunOutcome;
  /** Code on the last sticker that printed correctly. */
  lastPrintedCode?: string;
}

export interface PrintRunConfirmation {
  printed: number;
  notPrinted: number;
}
