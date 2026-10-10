import { ENDPOINTS } from "@/shared/constants/endpoints";
import { API_URL, HTTP_REQUEST_TIMEOUT } from "@/shared/constants/http";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/shared/helpers/token";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!),
  );
  pendingQueue = [];
}

const httpClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: HTTP_REQUEST_TIMEOUT,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) searchParams.append(key, String(item));
      } else {
        searchParams.append(key, String(value));
      }
    }
    return searchParams.toString();
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    const isAuthRequest =
      config.url === ENDPOINTS.auth.login ||
      config.url === ENDPOINTS.auth.refresh;

    if (accessToken && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

httpClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } =
      err.config;

    const isLoginUrl = originalRequest?.url === ENDPOINTS.auth.login;
    const isRefreshUrl = originalRequest?.url === ENDPOINTS.auth.refresh;

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isLoginUrl &&
      !isRefreshUrl
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(httpClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeAccessToken();
        removeRefreshToken();
        window.location.replace("/login");
        return Promise.reject(err.response?.data || err);
      }

      try {
        const res = await axios.post(`${API_URL}${ENDPOINTS.auth.refresh}`, {
          refreshToken,
        });
        const { accessToken: newAccess, refreshToken: newRefresh } =
          res.data.data;

        setAccessToken(newAccess);
        setRefreshToken(newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        processQueue(null, newAccess);
        return httpClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        removeAccessToken();
        removeRefreshToken();
        window.location.replace("/unauthorized");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err.response?.data || err);
  },
);

export default httpClient;
