import { voucherRedemptionService } from "@/services/voucher-redemption-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const VOUCHER_REDEMPTION_QUERY_KEYS = {
  all: ["vouchers", "redemptions"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...VOUCHER_REDEMPTION_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
} as const;

export const voucherRedemptionQueries = {
  keys: VOUCHER_REDEMPTION_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    useQuery({
      queryKey: voucherRedemptionQueries.keys.list(query),
      queryFn: () => voucherRedemptionService.getAll(query),
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
