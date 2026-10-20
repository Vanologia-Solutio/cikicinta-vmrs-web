"use client";

import { CopyText } from "@/components/general/copy-text";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { voucherRedemptionQueries } from "@/hooks/use-voucher-redemption";
import type { AppColumnDef } from "@/lib/table";
import {
  VoucherRedemption,
  VoucherRedemptionFilters,
} from "@/shared/types/voucher-redemption";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { RedemptionDetailsDialog } from "./redemption-details-dialog";
import { RedemptionHistoryFilters } from "./redemption-history-filters";
import { RedemptionSummaryCards } from "./redemption-summary-cards";

const DATE_TIME_FORMAT = "dd MMM yyyy HH:mm:ss";

const buildColumns = (
  onOpen: (row: VoucherRedemption) => void,
): AppColumnDef<VoucherRedemption>[] => [
  {
    accessorKey: "voucherCode",
    header: "Voucher code",
    cell: ({ row }) => (
      <CopyText
        text={row.original.voucherCode}
        textClassName="font-mono"
        onClick={() => onOpen(row.original)}
      />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name ?? "-",
  },
  {
    accessorKey: "benefit",
    header: "Benefit",
    cell: ({ row }) => row.original.benefit?.name ?? "-",
  },
  {
    accessorKey: "printedAt",
    header: "Printed at",
    size: 200,
    cell: ({ row }) =>
      row.original.printedAt
        ? format(new Date(row.original.printedAt), DATE_TIME_FORMAT)
        : "Never printed",
  },
  {
    accessorKey: "redeemedAt",
    header: "Redeemed at",
    size: 200,
    cell: ({ row }) =>
      format(new Date(row.original.redeemedAt), DATE_TIME_FORMAT),
  },
  {
    accessorKey: "redeemedByName",
    header: "Redeemed by",
    cell: ({ row }) => row.original.redeemedByName ?? "-",
  },
];

/** Redemptions visible to this site, newest first, with filters and totals. */
export function RedemptionHistoryTable({
  showSummary = true,
}: {
  /** The totals cards above the table; off where the table is secondary. */
  showSummary?: boolean;
}) {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const [filters, setFilters] = useState<VoucherRedemptionFilters>({});
  const { data, isLoading } = voucherRedemptionQueries.useList({
    ...pagination,
    ...filters,
  });
  const [selected, setSelected] = useState<VoucherRedemption | null>(null);

  // New filters go back to the first page.
  const handleFiltersChange = (next: VoucherRedemptionFilters) => {
    setFilters(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns = useMemo(() => buildColumns(setSelected), []);

  return (
    <section>
      {showSummary && (
        <RedemptionSummaryCards
          keyword={pagination.keyword}
          filters={filters}
        />
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          className="mb-0"
          keywordInput={keywordInput}
          setKeywordInput={setKeywordInput}
          totalRecords={data?.pagination?.totalRecords ?? 0}
          placeholder="Search voucher code..."
        />
        <RedemptionHistoryFilters
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>
      <PaginatedDataTable<VoucherRedemption>
        columns={columns}
        data={data?.data ?? []}
        states={{ isLoading }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{ onPaginationChange: setPagination }}
        getRowId={(row) => row.id}
      />
      <RedemptionDetailsDialog
        redemptionId={selected?.id ?? null}
        voucherCode={selected?.voucherCode ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
