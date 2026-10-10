import { MenuGroups } from "./menu";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: ClientState | null;
  accessibleMenus: MenuGroups;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface ClientState {
  sub: string;
  firstName: string;
  lastName: string | null;
  username: string;
  attrs: {
    tenant: {
      id: string;
      name: string;
      code: string;
      type: string;
      timezone: string;
      isPrimary: boolean;
    };
    role: {
      id: string;
      name: string;
      code: string;
    };
  };
  metadata: {
    onboardingCompleted: boolean;
  };
}

export interface Me extends ClientState {
  accessibleMenus: MenuGroups;
}
