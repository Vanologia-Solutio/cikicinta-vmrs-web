"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { syncScheduleQueries } from "@/hooks/use-sync-schedule";
import type { AppColumnDef } from "@/lib/table";
import { syncJobTypeLabel } from "@/shared/constants/sync-schedules";
import { SyncSchedule } from "@/shared/types/sync-schedule";
import { SYNC_SCHEDULE_TABLE_ACTIONS } from "./sync-schedule-table-actions";

const columns: AppColumnDef<SyncSchedule>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <code>{row.original.code}</code>,
  },
  { accessorKey: "platform", header: "Platform" },
  {
    accessorKey: "jobType",
    header: "Job",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{syncJobTypeLabel(row.original.jobType)}</span>
        <code className="text-xs text-muted-foreground">
          {row.original.jobType}
        </code>
      </div>
    ),
  },
  {
    accessorKey: "cronExpression",
    header: "Cron Expression",
    cell: ({ row }) => <code>{row.original.cronExpression}</code>,
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
    size: 132,
    cell: ({ row }) => (
      <EntityTableActions
        actions={SYNC_SCHEDULE_TABLE_ACTIONS}
        entity={row.original}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function SyncSchedulesTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading, isFetching } =
    syncScheduleQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
        placeholder="Search code, job or cron..."
      />
      <PaginatedDataTable<SyncSchedule>
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
