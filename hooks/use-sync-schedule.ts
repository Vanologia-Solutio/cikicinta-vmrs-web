import { syncScheduleService } from "@/services/sync-schedule-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import {
  CreateSyncScheduleDto,
  UpdateSyncScheduleDto,
} from "@/shared/dtos/sync-schedule";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SYNC_SCHEDULE_QUERY_KEYS = {
  all: ["sync-schedules"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...SYNC_SCHEDULE_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...SYNC_SCHEDULE_QUERY_KEYS.all, "create"] as const,
  update: () => [...SYNC_SCHEDULE_QUERY_KEYS.all, "update"] as const,
} as const;

export const syncScheduleQueries = {
  keys: SYNC_SCHEDULE_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: syncScheduleQueries.keys.list(query),
      queryFn: () => syncScheduleService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: syncScheduleQueries.keys.create(),
      mutationFn: (payload: CreateSyncScheduleDto) =>
        syncScheduleService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: syncScheduleQueries.keys.all,
        });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: syncScheduleQueries.keys.update(),
      mutationFn: (payload: UpdateSyncScheduleDto) =>
        syncScheduleService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: syncScheduleQueries.keys.all,
        });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => syncScheduleService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: syncScheduleQueries.keys.all,
        });
      },
    });
  },
};
