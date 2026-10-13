import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import {
  SyncConflict,
  SyncConflictStatus,
  SyncDirection,
  SyncHealth,
  SyncOutboxEvent,
  SyncOutboxStatus,
  SyncRunResult,
} from "@/shared/types/sync";
import { AxiosInstance } from "axios";

const { sync } = ENDPOINTS;
const withId = (path: string, id: string) => path.replace("{id}", id);

class SyncService {
  private httpClient: AxiosInstance = httpClient;

  async getHealth(): Promise<ApiResponse<SyncHealth>> {
    const res = await this.httpClient.get(sync.health);
    return res.data;
  }

  /** Runs one direction now instead of waiting for its schedule. */
  async run(direction: SyncDirection): Promise<ApiResponse<SyncRunResult>> {
    const res = await this.httpClient.post(sync.run, { direction });
    return res.data;
  }

  async getOutbox(
    query: PaginationQuery,
    status?: SyncOutboxStatus,
  ): Promise<PaginatedResponse<SyncOutboxEvent>> {
    const res = await this.httpClient.get(sync.outbox, {
      params: { ...query, status },
    });
    return res.data;
  }

  async retryOutboxEvent(id: string): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(withId(sync.retryOutbox, id));
    return res.data;
  }

  async getConflicts(
    query: PaginationQuery,
    status?: SyncConflictStatus,
  ): Promise<PaginatedResponse<SyncConflict>> {
    const res = await this.httpClient.get(sync.conflicts, {
      params: { ...query, status },
    });
    return res.data;
  }

  async resolveConflict(
    id: string,
    note?: string,
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(withId(sync.resolveConflict, id), {
      note,
    });
    return res.data;
  }

  /** Queues a batch and all of its vouchers to be sent again. */
  async republishBatch(
    batchId: string,
  ): Promise<ApiResponse<{ events: number }>> {
    const res = await this.httpClient.post(
      withId(sync.republishBatch, batchId),
    );
    return res.data;
  }
}

export const syncService = new SyncService();
