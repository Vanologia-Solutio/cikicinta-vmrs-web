import { PaginationQuery } from "../types/general";

export const PROJECT_NAME = "Setigi Heni";
export const PROJECT_DESCRIPTION = "Voucher Management & Redemption System";
export const PAGE_ANIMATE_IN = "animate-in fade-in duration-500";

export const HOME_ROUTE = "/dashboard";

export const PUBLIC_ROUTES: string[] = [
  "/login",
  "/logout",
  "/onboarding",
  "/callback",
  "/unauthorized",
  "/forbidden",
  "/not-found",
];

export const DEFAULT_PAGINATION_QUERY: PaginationQuery = {
  pageIndex: 0,
  pageSize: 100,
  keyword: "",
};

export const PAGINATION_SIZE_OPTIONS: number[] = [25, 50, 100, 200];
