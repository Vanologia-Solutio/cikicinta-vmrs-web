"use client";

import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { voucherBenefitQueries } from "@/hooks/use-voucher-benefit";
import type { AppColumnDef } from "@/lib/table";
import { VoucherBenefit } from "@/shared/types/voucher-benefit";
import { BooleanBadge } from "@/components/general/boolean-badge";
import { VOUCHER_BENEFIT_TABLE_ACTIONS } from "./voucher-benefit-table-actions";

const columns: AppColumnDef<VoucherBenefit>[] = [
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
    id: "category",
    header: "Category",
    accessorFn: (row) => row.category?.name ?? "",
    cell: ({ row }) => row.original.category?.name ?? "-",
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
        actions={VOUCHER_BENEFIT_TABLE_ACTIONS}
        entity={row.original}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function VoucherBenefitsTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading, isFetching } =
    voucherBenefitQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
      />
      <PaginatedDataTable<VoucherBenefit>
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
