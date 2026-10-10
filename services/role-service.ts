import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { CreateRoleDto, UpdateRoleDto } from "@/shared/dtos/role";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { Role } from "@/shared/types/role";
import { AxiosInstance } from "axios";

class RoleService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<Role>> {
    const res = await this.httpClient.get(ENDPOINTS.platforms.roles.getAll, {
      params: query,
    });
    return res.data;
  }

  async create(payload: CreateRoleDto): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(
      ENDPOINTS.platforms.roles.create,
      payload,
    );
    return res.data;
  }

  async update(payload: UpdateRoleDto): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.platforms.roles.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.platforms.roles.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const roleService = new RoleService();
