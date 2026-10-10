import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse } from "@/shared/types/api-response";
import { AxiosInstance } from "axios";

export interface LovOption {
  label: string;
  value: string;
}

export interface LovEntry extends LovOption {
  id: string;
}

export interface CreateLovDto {
  key: string;
  value: string;
  label: string;
  isActive?: boolean;
}

export interface UpdateLovDto {
  value?: string;
  label?: string;
  isActive?: boolean;
}

class LovService {
  private httpClient: AxiosInstance = httpClient;

  async getLovs(key: string): Promise<ApiResponse<LovOption[]>> {
    const res = await this.httpClient.get(ENDPOINTS.lovs.getLovs, {
      params: { key },
    });
    return res.data;
  }

  async createLov(dto: CreateLovDto): Promise<ApiResponse<LovEntry>> {
    const res = await this.httpClient.post(ENDPOINTS.lovs.createLov, dto);
    return res.data;
  }

  async updateLov(id: string, dto: UpdateLovDto): Promise<ApiResponse<null>> {
    const res = await this.httpClient.put(
      ENDPOINTS.lovs.updateLov.replace("{id}", id),
      dto,
    );
    return res.data;
  }

  async deleteLov(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.lovs.deleteLov.replace("{id}", id),
    );
    return res.data;
  }
}

export const lovService = new LovService();
