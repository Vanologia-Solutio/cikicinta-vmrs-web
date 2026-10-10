import { moduleService } from "@/services/module-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { CreateModuleDto, UpdateModuleDto } from "@/shared/dtos/module";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MODULE_QUERY_KEYS = {
  all: ["platforms", "modules"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...MODULE_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...MODULE_QUERY_KEYS.all, "create"] as const,
  update: () => [...MODULE_QUERY_KEYS.all, "update"] as const,
  delete: (id: string) => [...MODULE_QUERY_KEYS.all, "delete", id] as const,
} as const;

export const moduleQueries = {
  keys: MODULE_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: moduleQueries.keys.list(query),
      queryFn: () => moduleService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: moduleQueries.keys.create(),
      mutationFn: (payload: CreateModuleDto) => moduleService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: moduleQueries.keys.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: moduleQueries.keys.update(),
      mutationFn: (payload: UpdateModuleDto) => moduleService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: moduleQueries.keys.all });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => moduleService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: moduleQueries.keys.all });
      },
    });
  },
};
