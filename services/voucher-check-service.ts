import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse } from "@/shared/types/api-response";
import { VoucherCheckResult } from "@/shared/types/voucher-check";
import { AxiosInstance } from "axios";

class VoucherCheckService {
  private httpClient: AxiosInstance = httpClient;

  /** Read-only lookup: the voucher is not redeemed or changed. */
  async check(code: string): Promise<ApiResponse<VoucherCheckResult>> {
    const res = await this.httpClient.get(ENDPOINTS.vouchers.check, {
      params: { code },
    });
    return res.data;
  }
}

export const voucherCheckService = new VoucherCheckService();
