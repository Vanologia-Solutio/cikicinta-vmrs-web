import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import {
  CreateSyncScheduleDto,
  UpdateSyncScheduleDto,
} from "@/shared/dtos/sync-schedule";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { SyncSchedule } from "@/shared/types/sync-schedule";
import { AxiosInstance } from "axios";

class SyncScheduleService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<SyncSchedule>> {
    const res = await this.httpClient.get(
      ENDPOINTS.platforms.syncSchedules.getAll,
      { params: query },
    );
    return res.data;
  }

  async create(
    payload: CreateSyncScheduleDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      ENDPOINTS.platforms.syncSchedules.create,
      payload,
    );
    return res.data;
  }

  async update(
    payload: UpdateSyncScheduleDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.platforms.syncSchedules.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.platforms.syncSchedules.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const syncScheduleService = new SyncScheduleService();
