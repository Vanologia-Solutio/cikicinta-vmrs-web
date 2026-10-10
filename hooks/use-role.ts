import { roleService } from "@/services/role-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { CreateRoleDto, UpdateRoleDto } from "@/shared/dtos/role";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ROLE_QUERY_KEYS = {
  all: ["platforms", "roles"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...ROLE_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...ROLE_QUERY_KEYS.all, "create"] as const,
  update: () => [...ROLE_QUERY_KEYS.all, "update"] as const,
  delete: (id: string) => [...ROLE_QUERY_KEYS.all, "delete", id] as const,
} as const;

export const roleQueries = {
  keys: ROLE_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: roleQueries.keys.list(query),
      queryFn: () => roleService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: roleQueries.keys.create(),
      mutationFn: (payload: CreateRoleDto) => roleService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roleQueries.keys.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: roleQueries.keys.update(),
      mutationFn: (payload: UpdateRoleDto) => roleService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roleQueries.keys.all });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => roleService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roleQueries.keys.all });
      },
    });
  },
};
