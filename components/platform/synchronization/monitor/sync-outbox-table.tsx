"use client";

import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import { syncQueries } from "@/hooks/use-sync";
import type { AppColumnDef } from "@/lib/table";
import { errorMessage, notify } from "@/lib/toast";
import { syncEventLabel } from "@/shared/constants/sync-events";
import { SyncOutboxEvent, SyncOutboxStatus } from "@/shared/types/sync";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import { SyncStatusBadge } from "../sync-status-badge";

type StatusFilter = SyncOutboxStatus | "all";

const STATUS_FILTER_ITEMS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

const formatTime = (value: string | null) =>
  value ? format(new Date(value), "dd MMM yyyy HH:mm:ss") : "-";

/** Only a failed event can be queued again; the rest retry on their own. */
function RetryOutboxEventButton({ event }: { event: SyncOutboxEvent }) {
  const { mutateAsync: retry, isPending } = syncQueries.useRetryOutboxEvent();

  if (event.status !== "failed") return null;

  const handleClick = async () => {
    try {
      const res = await retry(event.id);
      notify.success(res.message ?? "Event queued again");
    } catch (error) {
      notify.error("Failed to retry the event", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Retry this event"
      title="Retry"
      disabled={isPending}
      onClick={handleClick}
    >
      <ArrowClockwiseIcon />
    </Button>
  );
}

const columns: AppColumnDef<SyncOutboxEvent>[] = [
  {
    accessorKey: "eventType",
    header: "Event",
    size: 220,
    cell: ({ row }) => syncEventLabel(row.original.eventType),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => <SyncStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "attemptCount",
    header: "Attempts",
    size: 100,
    meta: { align: "right" },
  },
  {
    accessorKey: "createdAt",
    header: "Recorded",
    size: 190,
    cell: ({ row }) => formatTime(row.original.createdAt),
  },
  {
    accessorKey: "publishedAt",
    header: "Published",
    size: 190,
    cell: ({ row }) => formatTime(row.original.publishedAt),
  },
  {
    accessorKey: "lastError",
    header: "Last error",
    cell: ({ row }) =>
      row.original.lastError ? (
        <span className="text-destructive" title={row.original.lastError}>
          {row.original.lastError}
        </span>
      ) : (
        "-"
      ),
  },
  {
    id: "actions",
    header: "Actions",
    size: 90,
    cell: ({ row }) => <RetryOutboxEventButton event={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];

export function SyncOutboxTable() {
  const { pagination, setPagination } = usePagination();
  const [status, setStatus] = useState<StatusFilter>("all");
  const { data, isLoading, isFetching } = syncQueries.useOutbox(
    pagination,
    status === "all" ? undefined : status,
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={(next) => {
            if (!next) return;
            setStatus(next);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger aria-label="Filter by status" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {STATUS_FILTER_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {data?.pagination?.totalRecords ?? 0} events
        </span>
      </div>

      <PaginatedDataTable<SyncOutboxEvent>
        columns={columns}
        data={data?.data ?? []}
        states={{ isLoading: isLoading || isFetching }}
        pagination={pagination}
        paginationData={data?.pagination}
        handlers={{ onPaginationChange: setPagination }}
        getRowId={(row) => row.id}
        showColumnsToggle={false}
      />
    </div>
  );
}
