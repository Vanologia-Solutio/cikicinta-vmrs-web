import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { CreateModuleDto, UpdateModuleDto } from "@/shared/dtos/module";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { PlatformModule } from "@/shared/types/module";
import { AxiosInstance } from "axios";

class ModuleService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<PlatformModule>> {
    const res = await this.httpClient.get(ENDPOINTS.platforms.modules.getAll, {
      params: query,
    });
    return res.data;
  }

  async create(payload: CreateModuleDto): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      ENDPOINTS.platforms.modules.create,
      payload,
    );
    return res.data;
  }

  async update(payload: UpdateModuleDto): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.platforms.modules.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.platforms.modules.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const moduleService = new ModuleService();
