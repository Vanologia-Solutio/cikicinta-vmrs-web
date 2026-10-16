"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import type { AppColumnDef } from "@/lib/table";
import { VoucherBatch } from "@/shared/types/voucher-batch";
import { formatSeparator } from "@/shared/utils/formatter";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { VOUCHER_BATCH_TABLE_ACTIONS } from "./voucher-batch-table-actions";
import { VoucherBatchStatusBadge } from "./voucher-batch-status-badge";

export const BATCHES_PATH = "/voucher-management/batches";

export const formatBatchDate = (date: string | null) =>
  date ? format(parseISO(date), "dd MMM yyyy") : "No expiry";

const columns: AppColumnDef<VoucherBatch>[] = [
  {
    accessorKey: "batchCode",
    header: "Batch",
    size: 220,
    cell: ({ row }) => (
      <Link
        href={`${BATCHES_PATH}/${row.original.id}`}
        className="font-mono underline-offset-4 hover:underline"
      >
        {row.original.batchCode}
      </Link>
    ),
  },
  {
    id: "category",
    header: "Category",
    accessorFn: (row) => row.category?.name ?? "",
    cell: ({ row }) => row.original.category?.name ?? "-",
  },
  {
    id: "benefit",
    header: "Benefit",
    accessorFn: (row) => row.benefit?.name ?? "",
    cell: ({ row }) => row.original.benefit?.name ?? "-",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    size: 110,
    meta: { align: "right" },
    cell: ({ row }) => formatSeparator(row.original.quantity),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 150,
    cell: ({ row }) => <VoucherBatchStatusBadge status={row.original.status} />,
  },
  {
    id: "validity",
    header: "Validity",
    size: 220,
    accessorFn: (row) => row.validFrom,
    cell: ({ row }) =>
      `${formatBatchDate(row.original.validFrom)} – ${formatBatchDate(row.original.expiredAt)}`,
  },
  {
    accessorKey: "printCount",
    header: "Stickers printed",
    size: 140,
    meta: { align: "right" },
    cell: ({ row }) => formatSeparator(row.original.printCount),
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
    size: 140,
    cell: ({ row }) => (
      <EntityTableActions
        actions={VOUCHER_BATCH_TABLE_ACTIONS}
        entity={row.original}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function VoucherBatchesTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading } = voucherBatchQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
      />
      <PaginatedDataTable<VoucherBatch>
        columns={columns}
        data={data?.data ?? []}
        // Background polling while a batch generates must not blank the table.
        states={{ isLoading }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{ onPaginationChange: setPagination }}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
