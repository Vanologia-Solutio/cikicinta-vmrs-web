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
  printerName?: string;
  voucherIds: string[];
}

export interface UpdatePrintLogDto {
  printJobId: string;
  status: PrintJobStatus;
  errorMessage?: string;
  voucherIds?: string[];
}
