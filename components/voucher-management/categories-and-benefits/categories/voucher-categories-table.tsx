"use client";

import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { voucherCategoryQueries } from "@/hooks/use-voucher-category";
import type { AppColumnDef } from "@/lib/table";
import { VoucherCategory } from "@/shared/types/voucher-category";
import { BooleanBadge } from "@/components/general/boolean-badge";
import { VOUCHER_CATEGORY_TABLE_ACTIONS } from "./voucher-category-table-actions";

const columns: AppColumnDef<VoucherCategory>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <code>{row.original.code}</code>,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "-",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    size: 100,
    cell: ({ row }) => <BooleanBadge value={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "Actions",
    size: 96,
    cell: ({ row }) => (
      <EntityTableActions
        actions={VOUCHER_CATEGORY_TABLE_ACTIONS}
        entity={row.original}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function VoucherCategoriesTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading, isFetching } =
    voucherCategoryQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
      />
      <PaginatedDataTable<VoucherCategory>
        columns={columns}
        data={data?.data ?? []}
        states={{ isLoading: isLoading || isFetching }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{ onPaginationChange: setPagination }}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
