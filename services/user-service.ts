import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { UpdateUserDto } from "@/shared/dtos/user";
import { ApiResponse, PaginatedResponse } from "@/shared/types/api-response";
import { PaginationQuery } from "@/shared/types/general";
import { User } from "@/shared/types/user";
import { AxiosInstance } from "axios";

class UserService {
  private httpClient: AxiosInstance = httpClient;

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<User>> {
    const res = await this.httpClient.get(ENDPOINTS.users.getAll, {
      params: query,
    });
    return res.data;
  }

  async getById(id: string): Promise<ApiResponse<User>> {
    const res = await this.httpClient.get(
      ENDPOINTS.users.getById.replace("{id}", id),
    );
    return res.data;
  }

  async update(payload: UpdateUserDto): Promise<ApiResponse<{ id: string }>> {
    const { id, ...rest } = payload;
    const res = await this.httpClient.put(
      ENDPOINTS.users.update.replace("{id}", id),
      rest,
    );
    return res.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await this.httpClient.delete(
      ENDPOINTS.users.delete.replace("{id}", id),
    );
    return res.data;
  }
}

export const userService = new UserService();
