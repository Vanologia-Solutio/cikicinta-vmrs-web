import { syncRouteService } from "@/services/sync-route-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import {
  CreateSyncRouteDto,
  UpdateSyncRouteDto,
} from "@/shared/dtos/sync-route";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SYNC_ROUTE_QUERY_KEYS = {
  all: ["sync-routes"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...SYNC_ROUTE_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...SYNC_ROUTE_QUERY_KEYS.all, "create"] as const,
  update: () => [...SYNC_ROUTE_QUERY_KEYS.all, "update"] as const,
} as const;

export const syncRouteQueries = {
  keys: SYNC_ROUTE_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: syncRouteQueries.keys.list(query),
      queryFn: () => syncRouteService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: syncRouteQueries.keys.create(),
      mutationFn: (payload: CreateSyncRouteDto) =>
        syncRouteService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: syncRouteQueries.keys.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: syncRouteQueries.keys.update(),
      mutationFn: (payload: UpdateSyncRouteDto) =>
        syncRouteService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: syncRouteQueries.keys.all });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => syncRouteService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: syncRouteQueries.keys.all });
      },
    });
  },
};
