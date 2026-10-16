"use client";

import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { voucherRedemptionQueries } from "@/hooks/use-voucher-redemption";
import type { AppColumnDef } from "@/lib/table";
import { VoucherRedemption } from "@/shared/types/voucher-redemption";
import { format } from "date-fns";

const columns: AppColumnDef<VoucherRedemption>[] = [
  {
    accessorKey: "voucherCode",
    header: "Voucher code",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.voucherCode}</span>
    ),
  },
  {
    accessorKey: "redeemedAt",
    header: "Redeemed at",
    size: 200,
    cell: ({ row }) =>
      format(new Date(row.original.redeemedAt), "dd MMM yyyy HH:mm:ss"),
  },
  {
    accessorKey: "redeemedByName",
    header: "Redeemed by",
    cell: ({ row }) => row.original.redeemedByName ?? "-",
  },
];

/** Redemptions recorded at this site, newest first. */
export function RedemptionHistoryTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading } = voucherRedemptionQueries.useList(pagination);

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Redemption history</h2>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
        placeholder="Search voucher code..."
      />
      <PaginatedDataTable<VoucherRedemption>
        columns={columns}
        data={data?.data ?? []}
        // A redemption refreshes the list; that must not blank the table.
        states={{ isLoading }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{ onPaginationChange: setPagination }}
        getRowId={(row) => row.id}
      />
    </section>
  );
}
