import {
  responsibilityService,
  UpdateResponsibilitiesPayload,
} from "@/services/responsibility-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const RESPONSIBILITY_QUERY_KEYS = {
  all: ["platforms", "responsibilities"] as const,
  detail: (tenantId: string, roleId: string) =>
    [...RESPONSIBILITY_QUERY_KEYS.all, tenantId, roleId] as const,
  update: () => [...RESPONSIBILITY_QUERY_KEYS.all, "update"] as const,
} as const;

export const responsibilityQueries = {
  keys: RESPONSIBILITY_QUERY_KEYS,

  useGet: (
    tenantId: string,
    roleId: string,
    options?: { enabled?: boolean },
  ) => {
    return useQuery({
      queryKey: responsibilityQueries.keys.detail(tenantId, roleId),
      queryFn: () => responsibilityService.get(tenantId, roleId),
      enabled: (options?.enabled ?? true) && !!tenantId && !!roleId,
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: responsibilityQueries.keys.update(),
      mutationFn: (payload: UpdateResponsibilitiesPayload) =>
        responsibilityService.update(payload),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: responsibilityQueries.keys.detail(
            variables.tenantId,
            variables.roleId,
          ),
        });
      },
    });
  },
};
