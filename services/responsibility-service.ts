import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse } from "@/shared/types/api-response";
import { AxiosInstance } from "axios";

export interface UpdateResponsibilitiesPayload {
  tenantId: string;
  roleId: string;
  menuIds: string[];
}

class ResponsibilityService {
  private httpClient: AxiosInstance = httpClient;

  async get(
    tenantId: string,
    roleId: string,
  ): Promise<ApiResponse<{ menuIds: string[] }>> {
    const res = await this.httpClient.get(
      ENDPOINTS.platforms.responsibilities.get,
      {
        params: { tenantId, roleId },
      },
    );
    return res.data;
  }

  async update(
    payload: UpdateResponsibilitiesPayload,
  ): Promise<ApiResponse<{ count: number }>> {
    const res = await this.httpClient.put(
      ENDPOINTS.platforms.responsibilities.update,
      payload,
    );
    return res.data;
  }
}

export const responsibilityService = new ResponsibilityService();
