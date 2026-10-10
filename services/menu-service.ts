import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { CreateMenuDto, UpdateMenuDto } from "@/shared/dtos/menu";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { Menu } from "@/shared/types/menu";
import { AxiosInstance } from "axios";

class MenuService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<Menu>> {
    const res = await this.httpClient.get(ENDPOINTS.platforms.menus.getAll, {
      params: query,
    });
    return res.data;
  }

  async create(payload: CreateMenuDto): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      ENDPOINTS.platforms.menus.create,
      payload,
    );
    return res.data;
  }

  async update(payload: UpdateMenuDto): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.platforms.menus.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.platforms.menus.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const menuService = new MenuService();
