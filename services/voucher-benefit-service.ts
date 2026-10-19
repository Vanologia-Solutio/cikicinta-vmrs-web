import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import {
  CreateVoucherBenefitDto,
  UpdateVoucherBenefitDto,
} from "@/shared/dtos/voucher-benefit";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { VoucherBenefitListItem } from "@/shared/types/voucher-benefit";
import { AxiosInstance } from "axios";

class VoucherBenefitService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<VoucherBenefitListItem>> {
    const res = await this.httpClient.get(ENDPOINTS.vouchers.benefits.getAll, {
      params: query,
    });
    return res.data;
  }

  async create(
    payload: CreateVoucherBenefitDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      ENDPOINTS.vouchers.benefits.create,
      payload,
    );
    return res.data;
  }

  async update(
    payload: UpdateVoucherBenefitDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.vouchers.benefits.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.vouchers.benefits.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const voucherBenefitService = new VoucherBenefitService();
