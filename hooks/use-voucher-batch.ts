import { voucherBatchService } from "@/services/voucher-batch-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import {
  CreatePrintLogDto,
  CreateVoucherBatchDto,
  PrintSelectionDto,
  UpdatePrintLogDto,
  UpdateVoucherBatchDto,
} from "@/shared/dtos/voucher-batch";
import { PaginationQuery } from "@/shared/types/general";
import { VoucherPrintedFilter } from "@/shared/types/voucher-batch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** How often a batch that is still generating is re-read. */
const GENERATING_POLL_MS = 2000;

const page = (query: PaginationQuery) =>
  [query.pageIndex, query.pageSize, query.keyword] as const;

const VOUCHER_BATCH_QUERY_KEYS = {
  all: ["vouchers", "batches"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [...VOUCHER_BATCH_QUERY_KEYS.all, "list", ...page(query)] as const,
  details: (id: string) =>
    [...VOUCHER_BATCH_QUERY_KEYS.all, "details", id] as const,
  vouchers: (
    id: string,
    query: PaginationQuery,
    printed: VoucherPrintedFilter,
  ) =>
    [
      ...VOUCHER_BATCH_QUERY_KEYS.details(id),
      "vouchers",
      ...page(query),
      printed,
    ] as const,
  printLogs: (id: string, query: PaginationQuery) =>
    [
      ...VOUCHER_BATCH_QUERY_KEYS.details(id),
      "print-logs",
      ...page(query),
    ] as const,
  create: () => [...VOUCHER_BATCH_QUERY_KEYS.all, "create"] as const,
  update: () => [...VOUCHER_BATCH_QUERY_KEYS.all, "update"] as const,
} as const;

export const voucherBatchQueries = {
  keys: VOUCHER_BATCH_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: voucherBatchQueries.keys.list(query),
      queryFn: () => voucherBatchService.getAll(query),
      refetchInterval: (q) =>
        q.state.data?.data.some((batch) => batch.status === "generating")
          ? GENERATING_POLL_MS
          : false,
    });
  },

  useDetails: (id: string) => {
    return useQuery({
      queryKey: voucherBatchQueries.keys.details(id),
      queryFn: () => voucherBatchService.getById(id),
      refetchInterval: (q) =>
        q.state.data?.data.status === "generating" ? GENERATING_POLL_MS : false,
    });
  },

  useVouchers: (
    id: string,
    query: PaginationQuery,
    printed: VoucherPrintedFilter,
    enabled = true,
  ) => {
    return useQuery({
      queryKey: voucherBatchQueries.keys.vouchers(id, query, printed),
      queryFn: () => voucherBatchService.getVouchers(id, query, printed),
      enabled,
    });
  },

  usePrintLogs: (id: string, query: PaginationQuery) => {
    return useQuery({
      queryKey: voucherBatchQueries.keys.printLogs(id, query),
      queryFn: () => voucherBatchService.getPrintLogs(id, query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: voucherBatchQueries.keys.create(),
      mutationFn: (payload: CreateVoucherBatchDto) =>
        voucherBatchService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBatchQueries.keys.all,
        });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: voucherBatchQueries.keys.update(),
      mutationFn: (payload: UpdateVoucherBatchDto) =>
        voucherBatchService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBatchQueries.keys.all,
        });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => voucherBatchService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBatchQueries.keys.all,
        });
      },
    });
  },

  useRegenerate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => voucherBatchService.regenerate(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBatchQueries.keys.all,
        });
      },
    });
  },

  usePrintSelection: (id: string) =>
    useMutation({
      mutationFn: (payload: PrintSelectionDto) =>
        voucherBatchService.getPrintSelection(id, payload),
    }),

  useCreatePrintLog: (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: CreatePrintLogDto) =>
        voucherBatchService.createPrintLog(id, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBatchQueries.keys.details(id),
        });
      },
    });
  },

  // A status change can move print counts on the batch, its vouchers and the
  // list, so everything under the batch keys is refreshed.
  useUpdatePrintLog: (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: UpdatePrintLogDto) =>
        voucherBatchService.updatePrintLog(id, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBatchQueries.keys.all,
        });
      },
    });
  },
};
