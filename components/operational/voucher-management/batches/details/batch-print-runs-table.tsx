"use client";

import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import type { AppColumnDef } from "@/lib/table";
import { VoucherPrintRun } from "@/shared/types/voucher-batch";
import { formatSeparator } from "@/shared/utils/formatter";
import { format } from "date-fns";
import { Fragment, useMemo, useState } from "react";
import { PrintRunDialog } from "./print-run-dialog";
import { RUN_STATUS_PRESENTATION } from "./print-status";

const formatTime = (value: string | null) =>
  value ? format(new Date(value), "dd MMM yyyy HH:mm:ss") : "-";

export function BatchPrintRunsTable({ batchId }: { batchId: string }) {
  const { pagination, setPagination } = usePagination();
  const { data, isLoading } = voucherBatchQueries.usePrintRuns(
    batchId,
    pagination,
  );
  const [openRunId, setOpenRunId] = useState<string | null>(null);

  // Looked up from the live list, so the dialog follows status changes.
  const openRun = useMemo(
    () => data?.data.find((run) => run.printRunId === openRunId) ?? null,
    [data, openRunId],
  );

  const columns = useMemo<AppColumnDef<VoucherPrintRun>[]>(
    () => [
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
        accessorKey: "jobCount",
        header: "Jobs",
        size: 80,
        meta: { align: "right" },
      },
      {
        accessorKey: "quantityRequested",
        header: "Stickers sent",
        size: 130,
        meta: { align: "right" },
        cell: ({ row }) => formatSeparator(row.original.quantityRequested),
      },
      {
        accessorKey: "quantityCompleted",
        header: "Confirmed printed",
        size: 150,
        meta: { align: "right" },
        cell: ({ row }) => formatSeparator(row.original.quantityCompleted),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        cell: ({ row }) => {
          const status = RUN_STATUS_PRESENTATION[row.original.status];
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 110,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant={
              row.original.status === "awaiting_check" ? "default" : "outline"
            }
            onClick={() => setOpenRunId(row.original.printRunId)}
          >
            {row.original.status === "awaiting_check" ? "Check" : "View"}
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  return (
    <Fragment>
      <PaginatedDataTable<VoucherPrintRun>
        columns={columns}
        data={data?.data ?? []}
        states={{ isLoading }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{ onPaginationChange: setPagination }}
        getRowId={(row) => row.printRunId}
        showColumnsToggle={false}
      />
      <PrintRunDialog
        batchId={batchId}
        run={openRun}
        onClose={() => setOpenRunId(null)}
      />
    </Fragment>
  );
}
