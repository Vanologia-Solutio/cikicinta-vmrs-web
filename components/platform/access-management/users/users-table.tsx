"use client";

import { BooleanBadge } from "@/components/general/boolean-badge";
import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { userQueries } from "@/hooks/use-user";
import type { AppColumnDef } from "@/lib/table";
import { User } from "@/shared/types/user";
import { fullName } from "@/shared/utils/user-formatter";
import { USER_TABLE_ACTIONS } from "./user-table-actions";

const columns: AppColumnDef<User>[] = [
  {
    id: "name",
    header: "Name",
    size: 220,
    accessorFn: (row) => fullName(row),
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{fullName(row.original)}</p>
        <p className="truncate text-muted-foreground">
          @{row.original.username}
        </p>
      </div>
    ),
  },
  {
    id: "tenant",
    header: "Tenant",
    accessorFn: (row) => row.tenant?.name ?? "",
    cell: ({ row }) => row.original.tenant?.name ?? "-",
  },
  {
    id: "role",
    header: "Role",
    accessorFn: (row) => row.role?.name ?? "",
    cell: ({ row }) => row.original.role?.name ?? "-",
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
      <EntityTableActions actions={USER_TABLE_ACTIONS} entity={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function UsersTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading, isFetching } = userQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
      />
      <PaginatedDataTable<User>
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
