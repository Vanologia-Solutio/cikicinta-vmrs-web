import { Env } from "../constants/environments";

const isSecure = (): boolean =>
  typeof window !== "undefined" && window.location.protocol === "https:";

export const setAccessToken = (token: string) => {
  document.cookie = [
    `${Env.ACCESS_TOKEN_NAME}=${token}`,
    "path=/",
    `max-age=${Env.ACCESS_TOKEN_EXPIRES_IN}`,
    "samesite=strict",
    isSecure() ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
};

export const getAccessToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    if (cookie.startsWith(`${Env.ACCESS_TOKEN_NAME}=`)) {
      return cookie.split("=")[1];
    }
  }

  return null;
};

export const removeAccessToken = () => {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${Env.ACCESS_TOKEN_NAME}=`,
    "path=/",
    `expires=${new Date(0).toUTCString()}`,
  ].join("; ");
};

export const setRefreshToken = (token: string) => {
  document.cookie = [
    `${Env.REFRESH_TOKEN_NAME}=${token}`,
    "path=/",
    `max-age=${Env.REFRESH_TOKEN_EXPIRES_IN}`,
    "samesite=strict",
    isSecure() ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
};

export const getRefreshToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    if (cookie.startsWith(`${Env.REFRESH_TOKEN_NAME}=`)) {
      return cookie.split("=")[1];
    }
  }

  return null;
};

export const removeRefreshToken = () => {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${Env.REFRESH_TOKEN_NAME}=`,
    "path=/",
    `expires=${new Date(0).toUTCString()}`,
  ].join("; ");
};
