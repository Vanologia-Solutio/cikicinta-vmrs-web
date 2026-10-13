import { syncService } from "@/services/sync-service";
import { PaginationQuery } from "@/shared/types/general";
import {
  SyncConflictStatus,
  SyncDirection,
  SyncOutboxStatus,
} from "@/shared/types/sync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** How often the overview is re-read while it is on screen. */
const HEALTH_POLL_MS = 15000;

const SYNC_QUERY_KEYS = {
  all: ["sync"] as const,
  health: () => [...SYNC_QUERY_KEYS.all, "health"] as const,
  outbox: (query: PaginationQuery, status?: SyncOutboxStatus) =>
    [
      ...SYNC_QUERY_KEYS.all,
      "outbox",
      query.pageIndex,
      query.pageSize,
      status,
    ] as const,
  conflicts: (query: PaginationQuery, status?: SyncConflictStatus) =>
    [
      ...SYNC_QUERY_KEYS.all,
      "conflicts",
      query.pageIndex,
      query.pageSize,
      status,
    ] as const,
} as const;

export const syncQueries = {
  keys: SYNC_QUERY_KEYS,

  useHealth: () =>
    useQuery({
      queryKey: syncQueries.keys.health(),
      queryFn: () => syncService.getHealth(),
      refetchInterval: HEALTH_POLL_MS,
    }),

  useOutbox: (query: PaginationQuery, status?: SyncOutboxStatus) =>
    useQuery({
      queryKey: syncQueries.keys.outbox(query, status),
      queryFn: () => syncService.getOutbox(query, status),
    }),

  useConflicts: (query: PaginationQuery, status?: SyncConflictStatus) =>
    useQuery({
      queryKey: syncQueries.keys.conflicts(query, status),
      queryFn: () => syncService.getConflicts(query, status),
    }),

  // Every action below changes what the overview and the tables show.
  useRun: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (direction: SyncDirection) => syncService.run(direction),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: syncQueries.keys.all });
      },
    });
  },

  useRetryOutboxEvent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => syncService.retryOutboxEvent(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: syncQueries.keys.all });
      },
    });
  },

  useResolveConflict: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { id: string; note?: string }) =>
        syncService.resolveConflict(payload.id, payload.note),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: syncQueries.keys.all });
      },
    });
  },

  useRepublishBatch: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (batchId: string) => syncService.republishBatch(batchId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: syncQueries.keys.all });
      },
    });
  },
};
