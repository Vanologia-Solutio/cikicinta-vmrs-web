"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { syncRouteQueries } from "@/hooks/use-sync-route";
import type { AppColumnDef } from "@/lib/table";
import { syncEventLabel } from "@/shared/constants/sync-events";
import { SyncRoute } from "@/shared/types/sync-route";
import { SYNC_ROUTE_TABLE_ACTIONS } from "./sync-route-table-actions";

const tenantName = (tenant: SyncRoute["sourceTenant"]) =>
  tenant ? [tenant.name, tenant.code].filter(Boolean).join(" - ") : "-";

const columns: AppColumnDef<SyncRoute>[] = [
  {
    id: "source",
    header: "From",
    accessorFn: (row) => row.sourceTenant?.name ?? "",
    cell: ({ row }) => tenantName(row.original.sourceTenant),
  },
  {
    id: "destination",
    header: "To",
    accessorFn: (row) => row.destinationTenant?.name ?? "",
    cell: ({ row }) => tenantName(row.original.destinationTenant),
  },
  {
    accessorKey: "eventType",
    header: "Event",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{syncEventLabel(row.original.eventType)}</span>
        <code className="text-xs text-muted-foreground">
          {row.original.eventType}
        </code>
      </div>
    ),
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
    size: 96,
    cell: ({ row }) => (
      <EntityTableActions
        actions={SYNC_ROUTE_TABLE_ACTIONS}
        entity={row.original}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function SyncRoutesTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading, isFetching } = syncRouteQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
        placeholder="Search event type..."
      />
      <PaginatedDataTable<SyncRoute>
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
