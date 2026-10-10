import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { LoginDto, RegisterDto } from "@/shared/dtos/auth";
import { ApiResponse } from "@/shared/types/api-response";
import { LoginResponse, Me } from "@/shared/types/auth";
import { AxiosInstance } from "axios";

class AuthService {
  private httpClient: AxiosInstance = httpClient;

  async login(payload: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const res = await this.httpClient.post(ENDPOINTS.auth.login, payload);
    return res.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const res = await this.httpClient.post(ENDPOINTS.auth.logout);
    return res.data;
  }

  async register(payload: RegisterDto): Promise<ApiResponse<{ id: string }>> {
    const res = await this.httpClient.post(ENDPOINTS.auth.register, payload);
    return res.data;
  }

  async refresh(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    const res = await this.httpClient.post(ENDPOINTS.auth.refresh, {
      refreshToken,
    });
    return res.data;
  }

  async me(): Promise<ApiResponse<Me>> {
    const res = await this.httpClient.get(ENDPOINTS.auth.me);
    return res.data;
  }

  async completeOnboarding(): Promise<ApiResponse<null>> {
    const res = await this.httpClient.post(ENDPOINTS.auth.onboarding);
    return res.data;
  }
}

export const authService = new AuthService();
