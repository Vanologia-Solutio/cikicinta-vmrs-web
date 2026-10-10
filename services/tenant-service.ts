import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { CreateTenantDto, UpdateTenantDto } from "@/shared/dtos/tenant";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { Tenant } from "@/shared/types/tenant";
import { AxiosInstance } from "axios";

class TenantService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<Tenant>> {
    const res = await this.httpClient.get(ENDPOINTS.tenants.getAll, {
      params: query,
    });
    return res.data;
  }

  async create(payload: CreateTenantDto): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(ENDPOINTS.tenants.create, payload);
    return res.data;
  }

  async update(payload: UpdateTenantDto): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.tenants.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.tenants.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const tenantService = new TenantService();
