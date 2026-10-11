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

/** The label settings the agent was started with (its .env). */
export interface AgentLabelSettings {
  dpi: number;
  labelWidthMm: number;
  labelHeightMm: number;
  columns: number;
  columnGapMm: number;
  rowWidthMm: number;
  rowGapMm: number;
  sensor: "gap" | "bline" | "continuous";
  offsetXMm: number;
  offsetYMm: number;
  moduleDots: number;
  barHeightMm: number;
  textFont: string;
  textGapMm: number;
  density?: number;
  speed?: number;
  direction: 0 | 1;
  peel?: boolean;
  tear?: boolean;
  codeLength: number;
  codeCharset: "numeric" | "alphanumeric";
  maxLabelsPerJob: number;
}

export interface AgentCalibrationResult {
  printerId: string;
  sensor: AgentLabelSettings["sensor"];
}

export interface AgentTestPrintResult {
  printerId: string;
  rows: number;
  labelCount: number;
  /** The all-zero code printed on every test sticker. */
  code: string;
}

export interface CreateAgentPrintJobDto {
  idempotencyKey: string;
  printerId: string;
  vouchers: AgentVoucher[];
  confirmReprint?: boolean;
}

/**
 * Where a queued job sits among the jobs of one print action. A retry names
 * the job it replaces instead, and takes over that job's place.
 */
export interface PrintJobRun {
  runId?: string;
  sequence?: number;
  retryOf?: string;
}

export interface AgentResponse<T> {
  success: boolean;
  data: T;
}
