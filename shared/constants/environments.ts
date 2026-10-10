export const Env = {
  ACCESS_TOKEN_NAME:
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_NAME || "vmrs_access_token",
  REFRESH_TOKEN_NAME:
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME || "vmrs_refresh_token",
  ACCESS_TOKEN_EXPIRES_IN:
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN || "900",
  REFRESH_TOKEN_EXPIRES_IN:
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES_IN || "604800",
};
