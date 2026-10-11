export type PrintJobStatus =
  "queued" | "processing" | "submitted" | "completed" | "failed" | "unknown";

export interface AgentVoucher {
  id: string;
  code: string;
}

export interface AgentHealth {
  status: string;
  version: string;
  adapter: string;
}

export interface AgentPrinter {
  id: string;
  name: string;
  driver?: string;
  port?: string;
  isDefault: boolean;
}

export interface AgentPrinterStatus {
  id: string;
  online: boolean | null;
  state: string;
  queuedJobs: number | null;
  detail?: string;
}

export interface AgentPrintJob {
  id: string;
  printerId: string;
  vouchers: AgentVoucher[];
  labelCount: number;
  rowCount: number;
  status: PrintJobStatus;
  detail?: string;
  error?: string;
  retryOf?: string;
  retriedBy?: string;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
}

export interface AgentBoxMm {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AgentLabelPreview {
  column: number;
  voucherId: string;
  code: string;
  cell: AgentBoxMm;
  barcode: AgentBoxMm;
  text: AgentBoxMm;
}

export interface AgentLayoutPreview {
  labelCount: number;
  rowCount: number;
  label: {
    dpi: number;
    columns: number;
    labelWidthMm: number;
    labelHeightMm: number;
    rowWidthMm: number;
    rowGapMm: number;
    moduleMm: number;
  };
  rows: { index: number; labels: AgentLabelPreview[] }[];
}

export interface CreateAgentPrintJobDto {
  idempotencyKey: string;
  printerId: string;
  vouchers: AgentVoucher[];
  confirmReprint?: boolean;
}

export interface AgentResponse<T> {
  success: boolean;
  data: T;
}
