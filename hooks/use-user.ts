import { authService } from "@/services/auth-service";
import { userService } from "@/services/user-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { RegisterDto } from "@/shared/dtos/auth";
import { UpdateUserDto } from "@/shared/dtos/user";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const USER_QUERY_KEYS = {
  all: ["users"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...USER_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  details: (userId: string) =>
    [...USER_QUERY_KEYS.all, "details", userId] as const,
  completeOnboarding: () =>
    [...USER_QUERY_KEYS.all, "complete-onboarding"] as const,
  register: () => [...USER_QUERY_KEYS.all, "register"] as const,
  update: () => [...USER_QUERY_KEYS.all, "update"] as const,
  delete: (userId: string) =>
    [...USER_QUERY_KEYS.all, "delete", userId] as const,
} as const;

export const userQueries = {
  keys: USER_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: userQueries.keys.list(query),
      queryFn: () => userService.getAll(query),
      enabled: query.pageIndex >= 0 && query.pageSize > 0,
    });
  },

  useDetails: (userId: string) => {
    return useQuery({
      queryKey: userQueries.keys.details(userId),
      queryFn: () => userService.getById(userId),
      enabled: !!userId,
    });
  },

  useCompleteOnboarding: () => {
    return useMutation({
      mutationKey: userQueries.keys.completeOnboarding(),
      mutationFn: () => authService.completeOnboarding(),
    });
  },

  useRegister: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: userQueries.keys.register(),
      mutationFn: (payload: RegisterDto) => authService.register(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userQueries.keys.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: userQueries.keys.update(),
      mutationFn: (payload: UpdateUserDto) => userService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userQueries.keys.all });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (userId: string) => userService.delete(userId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userQueries.keys.all });
      },
    });
  },
};
