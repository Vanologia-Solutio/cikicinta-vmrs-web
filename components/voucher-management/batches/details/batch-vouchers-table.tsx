"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import type { AppColumnDef } from "@/lib/table";
import { PrintSelectionDto } from "@/shared/dtos/voucher-batch";
import { Voucher, VoucherPrintedFilter } from "@/shared/types/voucher-batch";
import { formatTag } from "@/shared/utils/formatter";
import { PrinterIcon } from "@phosphor-icons/react";
import type { RowSelectionState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";

const PRINTED_FILTER_ITEMS: { value: VoucherPrintedFilter; label: string }[] = [
  { value: "all", label: "All vouchers" },
  { value: "unprinted", label: "Not printed" },
  { value: "printed", label: "Printed" },
];

const columns: AppColumnDef<Voucher>[] = [
  {
    id: "select",
    size: 44,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all vouchers on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select voucher ${row.original.code}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "Voucher code",
    cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 130,
    cell: ({ row }) => (
      <Badge variant="outline">{formatTag(row.original.status)}</Badge>
    ),
  },
  {
    accessorKey: "printCount",
    header: "Times printed",
    size: 130,
    meta: { align: "right" },
    cell: ({ row }) => Number(row.original.printCount),
  },
  {
    accessorKey: "lastPrintedAt",
    header: "Last printed",
    size: 190,
    cell: ({ row }) =>
      row.original.lastPrintedAt
        ? format(new Date(row.original.lastPrintedAt), "dd MMM yyyy HH:mm")
        : "Never",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    size: 100,
    cell: ({ row }) => <BooleanBadge value={row.original.isActive} />,
  },
];

interface BatchVouchersTableProps {
  batchId: string;
  /** False while the batch cannot be printed (not ready, or inactive). */
  canPrint: boolean;
  isPreparing: boolean;
  /** Asks for the given vouchers to be staged for printing. */
  onPrint: (selection: PrintSelectionDto) => void;
  /** Opens the printer dialog with nothing staged, to check or retry jobs. */
  onOpenPrinter: () => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (selection: RowSelectionState) => void;
}

export function BatchVouchersTable({
  batchId,
  canPrint,
  isPreparing,
  onPrint,
  onOpenPrinter,
  rowSelection,
  onRowSelectionChange,
}: BatchVouchersTableProps) {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const [printed, setPrinted] = useState<VoucherPrintedFilter>("all");
  const { data, isLoading, isFetching } = voucherBatchQueries.useVouchers(
    batchId,
    pagination,
    printed,
  );

  // Selection is keyed by voucher id, so it survives paging and filtering.
  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  );
  const disabled = !canPrint || isPreparing;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          className="mb-0"
          keywordInput={keywordInput}
          setKeywordInput={setKeywordInput}
          totalRecords={data?.pagination?.totalRecords ?? 0}
          placeholder="Search voucher code..."
        />
        <Select
          items={PRINTED_FILTER_ITEMS}
          value={printed}
          onValueChange={(next) => {
            if (!next) return;
            setPrinted(next);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger aria-label="Filter by print state" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {PRINTED_FILTER_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRowSelectionChange({})}
            >
              Clear selection
            </Button>
          )}
          <Button variant="ghost" disabled={!canPrint} onClick={onOpenPrinter}>
            Printer jobs
          </Button>
          <Button
            variant="outline"
            disabled={disabled || selectedIds.length === 0}
            onClick={() =>
              onPrint({ scope: "selected", voucherIds: selectedIds })
            }
          >
            <PrinterIcon />
            Print selected ({selectedIds.length})
          </Button>
          <Button
            variant="outline"
            disabled={disabled}
            onClick={() => onPrint({ scope: "unprinted" })}
          >
            <PrinterIcon />
            Print unprinted
          </Button>
          <Button disabled={disabled} onClick={() => onPrint({ scope: "all" })}>
            <PrinterIcon />
            Print all
          </Button>
        </div>
      </div>

      <PaginatedDataTable<Voucher>
        columns={columns}
        data={data?.data ?? []}
        states={{ isLoading: isLoading || isFetching, rowSelection }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{
          onPaginationChange: setPagination,
          onRowSelectionChange: (updater) =>
            onRowSelectionChange(
              typeof updater === "function" ? updater(rowSelection) : updater,
            ),
        }}
        getRowId={(row) => row.id}
        showColumnsToggle={false}
      />
    </div>
  );
}
