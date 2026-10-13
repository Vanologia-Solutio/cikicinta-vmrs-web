import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import {
  CreateSyncRouteDto,
  UpdateSyncRouteDto,
} from "@/shared/dtos/sync-route";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { SyncRoute } from "@/shared/types/sync-route";
import { AxiosInstance } from "axios";

const { syncRoutes } = ENDPOINTS.platforms;

class SyncRouteService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<SyncRoute>> {
    const res = await this.httpClient.get(syncRoutes.getAll, { params: query });
    return res.data;
  }

  async create(
    payload: CreateSyncRouteDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(syncRoutes.create, payload);
    return res.data;
  }

  async update(
    payload: UpdateSyncRouteDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      syncRoutes.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      syncRoutes.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const syncRouteService = new SyncRouteService();
