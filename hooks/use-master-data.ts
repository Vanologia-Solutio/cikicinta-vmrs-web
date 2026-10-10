import { masterDataService } from "@/services/master-data-service";
import { useQuery } from "@tanstack/react-query";

const MASTER_DATA_QUERY_KEYS = {
  all: ["master-data"] as const,
  activeRoles: () => [...MASTER_DATA_QUERY_KEYS.all, "active-roles"] as const,
  activeTenants: (excludePrimary?: boolean) =>
    [...MASTER_DATA_QUERY_KEYS.all, "active-tenants", excludePrimary] as const,
  activeTimezones: (keyword: string) =>
    [...MASTER_DATA_QUERY_KEYS.all, "active-timezones", keyword] as const,
  activeModules: () =>
    [...MASTER_DATA_QUERY_KEYS.all, "active-modules"] as const,
  activeMenus: (excludeId?: string) =>
    [...MASTER_DATA_QUERY_KEYS.all, "active-menus", excludeId] as const,
} as const;

interface Options {
  enabled?: boolean;
}

export const masterDataQueries = {
  keys: MASTER_DATA_QUERY_KEYS,

  useActiveRoles: (options?: Options) =>
    useQuery({
      queryKey: masterDataQueries.keys.activeRoles(),
      queryFn: () => masterDataService.getActiveRoles(),
      enabled: options?.enabled ?? true,
    }),

  useActiveTenants: (options?: Options & { excludePrimary?: boolean }) =>
    useQuery({
      queryKey: masterDataQueries.keys.activeTenants(options?.excludePrimary),
      queryFn: () =>
        masterDataService.getActiveTenants(options?.excludePrimary),
      enabled: options?.enabled ?? true,
    }),

  useActiveTimezones: (keyword: string, options?: Options) =>
    useQuery({
      queryKey: masterDataQueries.keys.activeTimezones(keyword),
      queryFn: () => masterDataService.getActiveTimezones(keyword),
      enabled: options?.enabled ?? true,
    }),

  useActiveModules: (options?: Options) =>
    useQuery({
      queryKey: masterDataQueries.keys.activeModules(),
      queryFn: () => masterDataService.getActiveModules(),
      enabled: options?.enabled ?? true,
    }),

  useActiveMenus: (options?: Options & { excludeId?: string }) =>
    useQuery({
      queryKey: masterDataQueries.keys.activeMenus(options?.excludeId),
      queryFn: () => masterDataService.getActiveMenus(options?.excludeId),
      enabled: options?.enabled ?? true,
    }),
};
