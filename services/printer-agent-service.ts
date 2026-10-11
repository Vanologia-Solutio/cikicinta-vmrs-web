import { PRINTER_AGENT_URL } from "@/shared/constants/http";
import { getPrinterAgentToken } from "@/shared/helpers/printer-agent-token";
import {
  AgentHealth,
  AgentLayoutPreview,
  AgentPrinter,
  AgentPrinterStatus,
  AgentPrintJob,
  AgentResponse,
  AgentVoucher,
  CreateAgentPrintJobDto,
} from "@/shared/types/printer-agent";
import axios, { AxiosError, AxiosInstance } from "axios";

/** `agent_unreachable` when nothing answered; otherwise the agent's own code. */
export class PrinterAgentError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "PrinterAgentError";
  }
}

interface AgentErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
}

function toAgentError(error: unknown): PrinterAgentError {
  const response = (error as AxiosError<AgentErrorBody>).response;
  if (!response) {
    return new PrinterAgentError(
      "agent_unreachable",
      "The printer agent is not responding on this computer.",
    );
  }
  return new PrinterAgentError(
    response.data?.code ?? "agent_error",
    response.data?.message ?? "The printer agent rejected the request.",
    response.status,
    response.data?.details,
  );
}

/**
 * Talks to the local printer agent, a separate process on the workstation.
 * It deliberately does not reuse the API http-client: different host, its own
 * pairing token, and none of the VMRS session cookies or refresh logic.
 */
export class PrinterAgentService {
  private readonly http: AxiosInstance;

  constructor(
    http: AxiosInstance = axios.create({
      baseURL: PRINTER_AGENT_URL,
      timeout: 15000,
    }),
    private readonly getToken: () => string | null = getPrinterAgentToken,
  ) {
    this.http = http;
    this.http.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    this.http.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(toAgentError(error)),
    );
  }

  private async unwrap<T>(
    request: Promise<{ data: AgentResponse<T> }>,
  ): Promise<T> {
    return (await request).data.data;
  }

  getHealth(): Promise<AgentHealth> {
    return this.unwrap(this.http.get("/health"));
  }

  getPrinters(): Promise<AgentPrinter[]> {
    return this.unwrap(this.http.get("/printers"));
  }

  getPrinterStatus(printerId: string): Promise<AgentPrinterStatus> {
    return this.unwrap(
      this.http.get(`/printers/${encodeURIComponent(printerId)}/status`),
    );
  }

  previewLayout(vouchers: AgentVoucher[]): Promise<AgentLayoutPreview> {
    return this.unwrap(
      this.http.post("/print-jobs/preview", { vouchers: pick(vouchers) }),
    );
  }

  createPrintJob(payload: CreateAgentPrintJobDto): Promise<AgentPrintJob> {
    return this.unwrap(
      this.http.post("/print-jobs", {
        ...payload,
        vouchers: pick(payload.vouchers),
      }),
    );
  }

  getPrintJobs(): Promise<AgentPrintJob[]> {
    return this.unwrap(this.http.get("/print-jobs"));
  }

  retryPrintJob(
    jobId: string,
    acknowledgeDuplicateRisk: boolean,
  ): Promise<AgentPrintJob> {
    return this.unwrap(
      this.http.post(
        `/print-jobs/${encodeURIComponent(jobId)}/retry`,
        acknowledgeDuplicateRisk ? { acknowledgeDuplicateRisk: true } : {},
      ),
    );
  }
}

// The agent rejects unknown fields, so only id and code are ever sent.
const pick = (vouchers: AgentVoucher[]): AgentVoucher[] =>
  vouchers.map(({ id, code }) => ({ id, code }));

export const printerAgentService = new PrinterAgentService();
