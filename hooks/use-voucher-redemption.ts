import { voucherRedemptionService } from "@/services/voucher-redemption-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { PaginationQuery } from "@/shared/types/general";
import { VoucherRedemptionFilters } from "@/shared/types/voucher-redemption";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type SummaryQuery = Pick<PaginationQuery, "keyword"> & VoucherRedemptionFilters;

const VOUCHER_REDEMPTION_QUERY_KEYS = {
  all: ["vouchers", "redemptions"] as const,
  list: (
    query: PaginationQuery &
      VoucherRedemptionFilters = DEFAULT_PAGINATION_QUERY,
  ) =>
    [
      ...VOUCHER_REDEMPTION_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
      query.categoryId,
      query.benefitId,
      query.startDate,
      query.endDate,
    ] as const,
  summary: (query: SummaryQuery) =>
    [
      ...VOUCHER_REDEMPTION_QUERY_KEYS.all,
      "summary",
      query.keyword,
      query.categoryId,
      query.benefitId,
      query.startDate,
      query.endDate,
    ] as const,
  details: (id: string) =>
    [...VOUCHER_REDEMPTION_QUERY_KEYS.all, "details", id] as const,
} as const;

export const voucherRedemptionQueries = {
  keys: VOUCHER_REDEMPTION_QUERY_KEYS,

  useList: (
    query: PaginationQuery &
      VoucherRedemptionFilters = DEFAULT_PAGINATION_QUERY,
  ) =>
    useQuery({
      queryKey: voucherRedemptionQueries.keys.list(query),
      queryFn: () => voucherRedemptionService.getAll(query),
    }),

  useSummary: (query: SummaryQuery) =>
    useQuery({
      queryKey: voucherRedemptionQueries.keys.summary(query),
      queryFn: () => voucherRedemptionService.getSummary(query),
    }),

  useDetails: (id: string | null) =>
    useQuery({
      queryKey: voucherRedemptionQueries.keys.details(id ?? ""),
      queryFn: () => voucherRedemptionService.getById(id!),
      enabled: !!id,
    }),

  useRedeem: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (code: string) => voucherRedemptionService.redeem(code),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherRedemptionQueries.keys.all,
        });
      },
    });
  },
};
