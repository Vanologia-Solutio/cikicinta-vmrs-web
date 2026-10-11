import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse } from "@/shared/types/api-response";
import { AxiosInstance } from "axios";

export interface IdName {
  id: string;
  name: string;
}

export interface IdTitle {
  id: string;
  title: string;
}

export interface ValueLabel {
  value: string;
  label: string;
}

class MasterDataService {
  private httpClient: AxiosInstance = httpClient;

  async getActiveTenants(
    excludePrimary?: boolean,
  ): Promise<ApiResponse<IdName[]>> {
    const res = await this.httpClient.get(
      ENDPOINTS.masterData.getActiveTenants,
      { params: { excludePrimary } },
    );
    return res.data;
  }

  async getActiveRoles(): Promise<ApiResponse<IdName[]>> {
    const res = await this.httpClient.get(ENDPOINTS.masterData.getActiveRoles);
    return res.data;
  }

  async getActiveModules(): Promise<ApiResponse<IdName[]>> {
    const res = await this.httpClient.get(
      ENDPOINTS.masterData.getActiveModules,
    );
    return res.data;
  }

  async getActiveMenus(excludeId?: string): Promise<ApiResponse<IdTitle[]>> {
    const res = await this.httpClient.get(ENDPOINTS.masterData.getActiveMenus, {
      params: { excludeId },
    });
    return res.data;
  }

  async getActiveVoucherCategories(): Promise<ApiResponse<IdName[]>> {
    const res = await this.httpClient.get(
      ENDPOINTS.masterData.getActiveVoucherCategories,
    );
    return res.data;
  }

  async getActiveVoucherBenefits(
    categoryId?: string,
  ): Promise<ApiResponse<IdName[]>> {
    const res = await this.httpClient.get(
      ENDPOINTS.masterData.getActiveVoucherBenefits,
      { params: { categoryId } },
    );
    return res.data;
  }

  async getActiveTimezones(
    keyword: string,
  ): Promise<ApiResponse<ValueLabel[]>> {
    const res = await this.httpClient.get(
      ENDPOINTS.masterData.getActiveTimezones,
      { params: { keyword, pageIndex: 0, pageSize: 50 } },
    );
    return res.data;
  }
}

export const masterDataService = new MasterDataService();
