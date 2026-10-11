import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import {
  CreatePrintLogDto,
  CreateVoucherBatchDto,
  PrintSelectionDto,
  UpdatePrintLogDto,
  UpdateVoucherBatchDto,
} from "@/shared/dtos/voucher-batch";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { AgentVoucher } from "@/shared/types/printer-agent";
import {
  Voucher,
  VoucherBatch,
  VoucherBatchDetail,
  VoucherPrintedFilter,
  VoucherPrintLog,
} from "@/shared/types/voucher-batch";
import { AxiosInstance } from "axios";

const { batches } = ENDPOINTS.vouchers;
const withId = (path: string, id: string) => path.replace("{id}", id);

class VoucherBatchService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<VoucherBatch>> {
    const res = await this.httpClient.get(batches.getAll, { params: query });
    return res.data;
  }

  async getById(id: string): Promise<ApiResponse<VoucherBatchDetail>> {
    const res = await this.httpClient.get(withId(batches.getById, id));
    return res.data;
  }

  async create(
    payload: CreateVoucherBatchDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(batches.create, payload);
    return res.data;
  }

  async update(
    payload: UpdateVoucherBatchDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(withId(batches.update, id), rest);
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(withId(batches.delete, id));
    return res.data;
  }

  async regenerate(id: string): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(withId(batches.regenerate, id));
    return res.data;
  }

  async getVouchers(
    id: string,
    query: PaginationQuery,
    printed: VoucherPrintedFilter,
  ): Promise<PaginatedResponse<Voucher>> {
    const res = await this.httpClient.get(withId(batches.vouchers, id), {
      params: {
        ...query,
        printed: printed === "all" ? undefined : printed === "printed",
      },
    });
    return res.data;
  }

  async getPrintSelection(
    id: string,
    payload: PrintSelectionDto,
  ): Promise<ApiResponse<AgentVoucher[]>> {
    const res = await this.httpClient.post(
      withId(batches.printSelection, id),
      payload,
    );
    return res.data;
  }

  async getPrintLogs(
    id: string,
    query: PaginationQuery,
  ): Promise<PaginatedResponse<VoucherPrintLog>> {
    const res = await this.httpClient.get(withId(batches.printLogs, id), {
      params: query,
    });
    return res.data;
  }

  async createPrintLog(
    id: string,
    payload: CreatePrintLogDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      withId(batches.printLogs, id),
      payload,
    );
    return res.data;
  }

  async updatePrintLog(
    id: string,
    payload: UpdatePrintLogDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const { printJobId, ...rest } = payload;
    const res = await this.httpClient.patch(
      withId(batches.printLog, id).replace("{printJobId}", printJobId),
      rest,
    );
    return res.data;
  }
}

export const voucherBatchService = new VoucherBatchService();
