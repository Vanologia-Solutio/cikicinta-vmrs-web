"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { CopyText } from "@/components/general/copy-text";
import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { Progress } from "@/components/ui/progress";
import { usePagination } from "@/hooks/use-pagination";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import type { AppColumnDef } from "@/lib/table";
import { VoucherBatchListItem } from "@/shared/types/voucher-batch";
import { formatSeparator } from "@/shared/utils/formatter";
import { format, parseISO } from "date-fns";
import { VOUCHER_BATCH_TABLE_ACTIONS } from "./voucher-batch-table-actions";
import { VoucherBatchStatusBadge } from "./voucher-batch-status-badge";

export const BATCHES_PATH = "/voucher-management/batches";

export const formatBatchDate = (date: string | null) =>
  date ? format(parseISO(date), "dd MMM yyyy") : "No expiry";

/** "count / total (n%)" over a progress bar. */
function CountProgress({
  count,
  total,
  label,
}: {
  count: number;
  total: number;
  label: string;
}) {
  // Floored, so 100% shows only once the whole total is reached.
  const percent = total > 0 ? Math.floor((count / total) * 100) : 0;
  return (
    <Progress
      value={count}
      max={Math.max(total, 1)}
      className="gap-1"
      aria-label={label}
    >
      <span className="w-full text-right text-xs tabular-nums">
        {formatSeparator(count)} / {formatSeparator(total)}{" "}
        <span className="text-muted-foreground">({percent}%)</span>
      </span>
    </Progress>
  );
}

const columns: AppColumnDef<VoucherBatchListItem>[] = [
  {
    accessorKey: "batchCode",
    header: "Batch",
    size: 220,
    cell: ({ row }) => (
      <CopyText
        text={row.original.batchCode}
        href={`${BATCHES_PATH}/${row.original.id}`}
        textClassName="font-mono"
      />
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
    id: "validity",
    header: "Validity",
    size: 220,
    accessorFn: (row) => row.validFrom,
    cell: ({ row }) =>
      `${formatBatchDate(row.original.validFrom)} - ${formatBatchDate(row.original.expiredAt)}`,
  },
  {
    accessorKey: "printedCount",
    header: "Printed / Quantity (%)",
    size: 180,
    cell: ({ row }) => (
      <CountProgress
        count={row.original.printedCount}
        total={row.original.quantity}
        label="Vouchers printed"
      />
    ),
  },
  {
    accessorKey: "redeemedCount",
    header: "Redeemed / Printed (%)",
    size: 180,
    // Only a printed sticker can be redeemed, so printed is the whole.
    cell: ({ row }) => (
      <CountProgress
        count={row.original.redeemedCount}
        total={row.original.printedCount}
        label="Printed vouchers redeemed"
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ row }) => <VoucherBatchStatusBadge status={row.original.status} />,
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
    size: 100,
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
      <PaginatedDataTable<VoucherBatchListItem>
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
