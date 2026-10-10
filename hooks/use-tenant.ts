import { tenantService } from "@/services/tenant-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { CreateTenantDto, UpdateTenantDto } from "@/shared/dtos/tenant";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TENANT_QUERY_KEYS = {
  all: ["tenants"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...TENANT_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...TENANT_QUERY_KEYS.all, "create"] as const,
  update: () => [...TENANT_QUERY_KEYS.all, "update"] as const,
  delete: (id: string) => [...TENANT_QUERY_KEYS.all, "delete", id] as const,
} as const;

export const tenantQueries = {
  keys: TENANT_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: tenantQueries.keys.list(query),
      queryFn: () => tenantService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: tenantQueries.keys.create(),
      mutationFn: (payload: CreateTenantDto) => tenantService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: tenantQueries.keys.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: tenantQueries.keys.update(),
      mutationFn: (payload: UpdateTenantDto) => tenantService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: tenantQueries.keys.all });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => tenantService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: tenantQueries.keys.all });
      },
    });
  },
};
