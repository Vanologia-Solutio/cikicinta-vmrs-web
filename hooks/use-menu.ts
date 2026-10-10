import { menuService } from "@/services/menu-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { CreateMenuDto, UpdateMenuDto } from "@/shared/dtos/menu";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MENU_QUERY_KEYS = {
  all: ["platforms", "menus"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...MENU_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...MENU_QUERY_KEYS.all, "create"] as const,
  update: () => [...MENU_QUERY_KEYS.all, "update"] as const,
  delete: (id: string) => [...MENU_QUERY_KEYS.all, "delete", id] as const,
} as const;

export const menuQueries = {
  keys: MENU_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: menuQueries.keys.list(query),
      queryFn: () => menuService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: menuQueries.keys.create(),
      mutationFn: (payload: CreateMenuDto) => menuService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: menuQueries.keys.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: menuQueries.keys.update(),
      mutationFn: (payload: UpdateMenuDto) => menuService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: menuQueries.keys.all });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => menuService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: menuQueries.keys.all });
      },
    });
  },
};
