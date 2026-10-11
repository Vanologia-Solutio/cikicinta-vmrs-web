"use client";

import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/hooks/use-pagination";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import type { AppColumnDef } from "@/lib/table";
import { VoucherPrintLog } from "@/shared/types/voucher-batch";
import { formatSeparator } from "@/shared/utils/formatter";
import { JOB_STATUS_PRESENTATION } from "@/shared/utils/printer-agent";
import { format } from "date-fns";

const formatTime = (value: string | null) =>
  value ? format(new Date(value), "dd MMM yyyy HH:mm:ss") : "-";

const columns: AppColumnDef<VoucherPrintLog>[] = [
  {
    accessorKey: "createdAt",
    header: "Requested",
    size: 190,
    cell: ({ row }) => formatTime(row.original.createdAt),
  },
  {
    accessorKey: "printerName",
    header: "Printer",
    cell: ({ row }) => row.original.printerName ?? "-",
  },
  {
    accessorKey: "quantityRequested",
    header: "Requested qty",
    size: 130,
    meta: { align: "right" },
    cell: ({ row }) => formatSeparator(row.original.quantityRequested),
  },
  {
    accessorKey: "quantityCompleted",
    header: "Printed qty",
    size: 120,
    meta: { align: "right" },
    cell: ({ row }) => formatSeparator(row.original.quantityCompleted),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 150,
    cell: ({ row }) => {
      const status = JOB_STATUS_PRESENTATION[row.original.status];
      return (
        <Badge variant={status?.variant ?? "outline"}>
          {status?.label ?? row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "completedAt",
    header: "Finished",
    size: 190,
    cell: ({ row }) => formatTime(row.original.completedAt),
  },
  {
    accessorKey: "errorMessage",
    header: "Details",
    cell: ({ row }) =>
      row.original.errorMessage ??
      JOB_STATUS_PRESENTATION[row.original.status]?.description ??
      "-",
  },
];

export function BatchPrintLogsTable({ batchId }: { batchId: string }) {
  const { pagination, setPagination } = usePagination();
  const { data, isLoading } = voucherBatchQueries.usePrintLogs(
    batchId,
    pagination,
  );

  return (
    <PaginatedDataTable<VoucherPrintLog>
      columns={columns}
      data={data?.data ?? []}
      states={{ isLoading }}
      pagination={pagination}
      paginationData={data?.pagination}
      handlers={{ onPaginationChange: setPagination }}
      getRowId={(row) => row.id}
      showColumnsToggle={false}
    />
  );
}
