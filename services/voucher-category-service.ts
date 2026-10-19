import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import {
  CreateVoucherCategoryDto,
  UpdateVoucherCategoryDto,
} from "@/shared/dtos/voucher-category";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { VoucherCategoryListItem } from "@/shared/types/voucher-category";
import { AxiosInstance } from "axios";

class VoucherCategoryService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<VoucherCategoryListItem>> {
    const res = await this.httpClient.get(
      ENDPOINTS.vouchers.categories.getAll,
      {
        params: query,
      },
    );
    return res.data;
  }

  async create(
    payload: CreateVoucherCategoryDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      ENDPOINTS.vouchers.categories.create,
      payload,
    );
    return res.data;
  }

  async update(
    payload: UpdateVoucherCategoryDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.vouchers.categories.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.vouchers.categories.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const voucherCategoryService = new VoucherCategoryService();
