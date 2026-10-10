"use client";

import { EntityTableActions } from "@/components/general/entity-table-actions";
import { PaginatedDataTable } from "@/components/general/paginated-data-table";
import { SearchBar } from "@/components/general/search-bar";
import { usePagination } from "@/hooks/use-pagination";
import { menuQueries } from "@/hooks/use-menu";
import type { AppColumnDef } from "@/lib/table";
import { Menu } from "@/shared/types/menu";
import { BooleanBadge } from "@/components/general/boolean-badge";
import { DynamicIcon } from "@/components/general/icon";
import { Badge } from "@/components/ui/badge";
import { MENU_TABLE_ACTIONS } from "./menu-table-actions";

const columns: AppColumnDef<Menu>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "path",
    header: "Path",
    size: 260,
    cell: ({ row }) => <code>{row.original.path}</code>,
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => (
      <Badge variant="outline">
        <DynamicIcon name={row.original.icon} />
        {row.original.icon}
      </Badge>
    ),
  },
  {
    id: "parent",
    header: "Parent",
    accessorFn: (row) => row.parent?.title ?? "",
    cell: ({ row }) => row.original.parent?.title ?? "-",
  },
  {
    id: "module",
    header: "Module",
    accessorFn: (row) => row.module?.name ?? "",
    cell: ({ row }) => row.original.module?.name ?? "-",
  },
  {
    accessorKey: "isVisible",
    header: "Visible",
    size: 100,
    cell: ({ row }) => <BooleanBadge value={row.original.isVisible} />,
  },
  {
    accessorKey: "isActive",
    header: "Active",
    size: 100,
    cell: ({ row }) => <BooleanBadge value={row.original.isActive} />,
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    size: 100,
    cell: ({ row }) => <BooleanBadge value={row.original.isDefault} />,
  },
  {
    id: "actions",
    header: "Actions",
    size: 96,
    cell: ({ row }) => (
      <EntityTableActions actions={MENU_TABLE_ACTIONS} entity={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function MenusTable() {
  const { pagination, setPagination, keywordInput, setKeywordInput } =
    usePagination();
  const { data, isLoading, isFetching } = menuQueries.useList(pagination);

  return (
    <div>
      <SearchBar
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        totalRecords={data?.pagination?.totalRecords ?? 0}
      />
      <PaginatedDataTable<Menu>
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
