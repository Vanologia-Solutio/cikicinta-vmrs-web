import { authService } from "@/services/auth-service";
import { create } from "zustand";
import { LoginDto } from "../dtos/auth";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../helpers/token";
import { ApiResponse } from "../types/api-response";
import { AuthState, ClientState, LoginResponse, Me } from "../types/auth";

interface AuthStore extends AuthState {
  isInitializing: boolean;
  signIn: (credential: LoginDto) => Promise<ApiResponse<LoginResponse>>;
  signOut: () => void;
  initialize: () => Promise<void>;
  /** Re-reads /auth/me (user + menus) without the full-screen initializing state. */
  refresh: () => Promise<void>;
}

const generateUser = (me: Me): ClientState => {
  return {
    sub: me.sub,
    firstName: me.firstName || "",
    lastName: me.lastName || "",
    username: me.username || "",
    attrs: me.attrs,
    metadata: me.metadata,
  };
};

const DEFAULT_STATE: Partial<AuthStore> = {
  user: null,
  accessibleMenus: {},
  isAuthenticated: false,
  isInitializing: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessibleMenus: {},
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: true,

  signIn: async (credential: LoginDto) => {
    set({ isLoading: true, error: null });

    try {
      const res = await authService.login(credential);
      if (!res.success) {
        set({ error: new Error(res.message) });
        return res;
      }

      const { accessToken, refreshToken } = res.data;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      return res;
    } catch (err) {
      set({ error: err as Error });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: () => {
    removeAccessToken();
    removeRefreshToken();
    set(DEFAULT_STATE);
  },

  initialize: async () => {
    set({ isInitializing: true });

    try {
      if (!getAccessToken()) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          set(DEFAULT_STATE);
          return;
        }

        const refreshed = await authService.refresh(refreshToken);
        setAccessToken(refreshed.data.accessToken);
        setRefreshToken(refreshed.data.refreshToken);
      }

      const me = await authService.me();

      set({
        user: generateUser(me.data),
        accessibleMenus: me.data.accessibleMenus,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      set(DEFAULT_STATE);
    }
  },

  refresh: async () => {
    const me = await authService.me();
    set({
      user: generateUser(me.data),
      accessibleMenus: me.data.accessibleMenus,
    });
  },
}));
