"use client";

import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
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
import { syncEventLabel } from "@/shared/constants/sync-events";
import { SyncConflict, SyncConflictStatus } from "@/shared/types/sync";
import { formatTag } from "@/shared/utils/formatter";
import { format } from "date-fns";
import { useState } from "react";
import { SyncStatusBadge } from "../sync-status-badge";
import { SYNC_CONFLICT_TABLE_ACTIONS } from "./sync-conflict-actions";

type StatusFilter = SyncConflictStatus | "all";

const STATUS_FILTER_ITEMS: { value: StatusFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All conflicts" },
];

const columns: AppColumnDef<SyncConflict>[] = [
  {
    accessorKey: "reason",
    header: "Conflict",
    size: 240,
    cell: ({ row }) => formatTag(row.original.reason),
  },
  {
    accessorKey: "eventType",
    header: "Event",
    size: 200,
    cell: ({ row }) => syncEventLabel(row.original.eventType),
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => row.original.details ?? "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    cell: ({ row }) => <SyncStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Found",
    size: 180,
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm"),
  },
  {
    id: "actions",
    header: "Actions",
    size: 96,
    cell: ({ row }) => (
      <EntityTableActions
        actions={SYNC_CONFLICT_TABLE_ACTIONS}
        entity={row.original}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function SyncConflictsTable() {
  const { pagination, setPagination } = usePagination();
  const [status, setStatus] = useState<StatusFilter>("open");
  const { data, isLoading, isFetching } = syncQueries.useConflicts(
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
          {data?.pagination?.totalRecords ?? 0} conflicts
        </span>
      </div>

      <PaginatedDataTable<SyncConflict>
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
