import { CreateLovDto, UpdateLovDto, lovService } from "@/services/lov-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const LOV_QUERY_KEYS = {
  all: ["lov"] as const,
  list: (key: string) => [...LOV_QUERY_KEYS.all, key] as const,
} as const;

export const lovQueries = {
  keys: LOV_QUERY_KEYS,

  useList: (key: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: lovQueries.keys.list(key),
      queryFn: () => lovService.getLovs(key),
      enabled: options?.enabled ?? true,
    }),

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: CreateLovDto) => lovService.createLov(payload),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: lovQueries.keys.list(variables.key),
        });
      },
    });
  },

  useUpdate: (key: string) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateLovDto }) =>
        lovService.updateLov(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: lovQueries.keys.list(key) });
      },
    });
  },

  useDelete: (key: string) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => lovService.deleteLov(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: lovQueries.keys.list(key) });
      },
    });
  },
};
