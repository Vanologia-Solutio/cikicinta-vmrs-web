import { masterDataQueries } from "@/hooks/use-master-data";
import { voucherCategoryService } from "@/services/voucher-category-service";
import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import {
  CreateVoucherCategoryDto,
  UpdateVoucherCategoryDto,
} from "@/shared/dtos/voucher-category";
import { PaginationQuery } from "@/shared/types/general";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const VOUCHER_CATEGORY_QUERY_KEYS = {
  all: ["vouchers", "categories"] as const,
  list: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) =>
    [
      ...VOUCHER_CATEGORY_QUERY_KEYS.all,
      "list",
      query.pageIndex,
      query.pageSize,
      query.keyword,
    ] as const,
  create: () => [...VOUCHER_CATEGORY_QUERY_KEYS.all, "create"] as const,
  update: () => [...VOUCHER_CATEGORY_QUERY_KEYS.all, "update"] as const,
  delete: (id: string) =>
    [...VOUCHER_CATEGORY_QUERY_KEYS.all, "delete", id] as const,
} as const;

// Benefits embed their category and the benefit form lists active categories,
// so a category change refreshes everything under "vouchers" plus that lookup.
function invalidateVoucherCategories(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["vouchers"] });
  queryClient.invalidateQueries({
    queryKey: masterDataQueries.keys.activeVoucherCategories(),
  });
}

export const voucherCategoryQueries = {
  keys: VOUCHER_CATEGORY_QUERY_KEYS,

  useList: (query: PaginationQuery = DEFAULT_PAGINATION_QUERY) => {
    return useQuery({
      queryKey: voucherCategoryQueries.keys.list(query),
      queryFn: () => voucherCategoryService.getAll(query),
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: voucherCategoryQueries.keys.create(),
      mutationFn: (payload: CreateVoucherCategoryDto) =>
        voucherCategoryService.create(payload),
      onSuccess: () => invalidateVoucherCategories(queryClient),
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: voucherCategoryQueries.keys.update(),
      mutationFn: (payload: UpdateVoucherCategoryDto) =>
        voucherCategoryService.update(payload),
      onSuccess: () => invalidateVoucherCategories(queryClient),
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => voucherCategoryService.delete(id),
      onSuccess: () => invalidateVoucherCategories(queryClient),
    });
  },
};
