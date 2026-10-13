import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import {
  VoucherRedemption,
  VoucherRedemptionResult,
} from "@/shared/types/voucher-redemption";
import { AxiosInstance } from "axios";

class VoucherRedemptionService {
  private httpClient: AxiosInstance = httpClient;

  /** Redeems the voucher. This cannot be undone. */
  async redeem(code: string): Promise<ApiResponse<VoucherRedemptionResult>> {
    const res = await this.httpClient.post(ENDPOINTS.vouchers.redeem, { code });
    return res.data;
  }

  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<VoucherRedemption>> {
    const res = await this.httpClient.get(ENDPOINTS.vouchers.redemptions, {
      params: query,
    });
    return res.data;
  }
}

export const voucherRedemptionService = new VoucherRedemptionService();
