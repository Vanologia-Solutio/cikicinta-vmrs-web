import { masterDataQueries } from "@/hooks/use-master-data";
import { voucherBenefitService } from "@/services/voucher-benefit-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import {
  CreateVoucherBenefitDto,
  UpdateVoucherBenefitDto,
} from "@/shared/dtos/voucher-benefit";
import { PaginationQuery } from "@/shared/types/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const VOUCHER_BENEFIT_QUERY_KEYS = {
  all: ["vouchers", "benefits"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...VOUCHER_BENEFIT_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...VOUCHER_BENEFIT_QUERY_KEYS.all, "create"] as const,
  update: () => [...VOUCHER_BENEFIT_QUERY_KEYS.all, "update"] as const,
  delete: (id: string) =>
    [...VOUCHER_BENEFIT_QUERY_KEYS.all, "delete", id] as const,
} as const;

export const voucherBenefitQueries = {
  keys: VOUCHER_BENEFIT_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: voucherBenefitQueries.keys.list(query),
      queryFn: () => voucherBenefitService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: voucherBenefitQueries.keys.create(),
      mutationFn: (payload: CreateVoucherBenefitDto) =>
        voucherBenefitService.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBenefitQueries.keys.all,
        });
        queryClient.invalidateQueries({
          queryKey: [...masterDataQueries.keys.all, "active-voucher-benefits"],
        });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: voucherBenefitQueries.keys.update(),
      mutationFn: (payload: UpdateVoucherBenefitDto) =>
        voucherBenefitService.update(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBenefitQueries.keys.all,
        });
        queryClient.invalidateQueries({
          queryKey: [...masterDataQueries.keys.all, "active-voucher-benefits"],
        });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => voucherBenefitService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: voucherBenefitQueries.keys.all,
        });
        queryClient.invalidateQueries({
          queryKey: [...masterDataQueries.keys.all, "active-voucher-benefits"],
        });
      },
    });
  },
};
