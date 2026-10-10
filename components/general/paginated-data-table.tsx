"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAppTable, type AppColumnDef } from "@/lib/table";
import { cn } from "@/lib/utils";
import { PAGINATION_SIZE_OPTIONS } from "@/shared/constants/common";
import { PaginatedResponse } from "@/shared/types/api-response";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import type {
  ColumnVisibilityState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useId, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Input } from "../ui/input";
import {
  columnAlignClass,
  ResizableHeaderRow,
  ResizableTableColumns,
  useResizableColumns,
} from "./resizable-table-header";
import {
  TableColumnsToggle,
  useColumnsToggleSlot,
} from "./table-columns-toggle";

function getPaginationRange(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const boundaryCount = 3;
  const siblingCount = 2;

  const shown = new Set<number>();
  for (let i = 1; i <= Math.min(boundaryCount, total); i++) shown.add(i);
  for (let i = Math.max(total - boundaryCount + 1, 1); i <= total; i++)
    shown.add(i);
  for (
    let i = Math.max(current - siblingCount, 1);
    i <= Math.min(current + siblingCount, total);
    i++
  )
    shown.add(i);

  const pages = [...shown].sort((a, b) => a - b);
  const range: (number | "ellipsis")[] = [];
  for (const page of pages) {
    const prev = range[range.length - 1];
    if (typeof prev === "number" && page - prev > 1) {
      range.push("ellipsis");
    }
    range.push(page);
  }

  return range;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PaginatedDataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: AppColumnDef<T>[];
  pagination: PaginationState;
  paginationData?: PaginatedResponse<T>["pagination"];
  handlers: {
    onPaginationChange: OnChangeFn<PaginationState>;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onRowClick?: (row: T) => void;
  };
  states?: {
    isLoading?: boolean;
    rowSelection?: RowSelectionState;
  };
  getRowId?: (row: T) => string;
  isRowClickable?: (row: T) => boolean;
  /** Show the "Columns" visibility menu (default true). */
  showColumnsToggle?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PaginatedDataTable<T extends Record<string, any>>({
  data,
  columns,
  pagination,
  paginationData = {
    page: 1,
    limit: 100,
    totalRecords: 0,
    totalPages: 1,
  },
  handlers: { onPaginationChange, onRowSelectionChange, onRowClick },
  states,
  getRowId,
  isRowClickable,
  showColumnsToggle = true,
}: PaginatedDataTableProps<T>) {
  const id = useId();
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const { anchorRef, slot } = useColumnsToggleSlot();

  const table = useAppTable({
    data,
    columns,
    state: {
      pagination,
      rowSelection: states?.rowSelection ?? {},
      columnVisibility,
    },
    // Server-side pagination: `data` is already the requested page.
    manualPagination: true,
    rowCount: paginationData.totalRecords,
    onPaginationChange,
    onRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId,
  });

  const columnLayout = useResizableColumns(table);

  const currentPage = table.state.pagination.pageIndex + 1;
  const totalPages = Math.max(paginationData.totalPages ?? 1, 1);
  const pageRange = getPaginationRange(currentPage, totalPages);
  const rows = table.getRowModel().rows;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pageInputValue, setPageInputValue] = useState("");

  const commitPageInput = () => {
    const parsed = Number(pageInputValue);
    if (Number.isInteger(parsed)) {
      const clamped = Math.min(Math.max(parsed, 1), totalPages);
      table.setPageIndex(clamped - 1);
    }
    setEditingIndex(null);
    setPageInputValue("");
  };

  const firstRecord =
    paginationData.totalRecords === 0
      ? 0
      : (paginationData.page - 1) * paginationData.limit + 1;
  const lastRecord = Math.min(
    paginationData.page * paginationData.limit,
    paginationData.totalRecords,
  );

  return (
    <div ref={anchorRef} className="min-w-0 space-y-4">
      {showColumnsToggle && <TableColumnsToggle table={table} slot={slot} />}
      <div className="overflow-x-auto rounded-lg border">
        <div style={{ minWidth: columnLayout.minWidth }}>
          <ResizableHeaderRow columns={columnLayout} />
          <Table style={{ tableLayout: "fixed" }}>
            <ResizableTableColumns columns={columnLayout} />
            <TableBody>
              {states?.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SpinnerGapIcon className="size-10 animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Loading...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row) => {
                  const clickable =
                    !!onRowClick &&
                    (isRowClickable ? isRowClickable(row.original) : true);
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(clickable && "cursor-pointer")}
                      onClick={
                        clickable ? () => onRowClick(row.original) : undefined
                      }
                      tabIndex={clickable ? 0 : undefined}
                      onKeyDown={
                        clickable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onRowClick(row.original);
                              }
                            }
                          : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "overflow-hidden text-ellipsis",
                            columnAlignClass(cell.column.columnDef.meta?.align),
                          )}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length}>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <MagnifyingGlassIcon />
                        </EmptyMedia>
                        <EmptyTitle>No Records Found</EmptyTitle>
                        <EmptyDescription>
                          No records matched your needs. Try adjusting the
                          filters, search term, or add new records.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={String(table.state.pagination.pageSize)}
            onValueChange={(value) => {
              if (value) table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {PAGINATION_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex grow justify-end">
          <p
            className="text-sm whitespace-nowrap text-muted-foreground"
            aria-live="polite"
          >
            <span className="text-foreground">
              {firstRecord}-{lastRecord}
            </span>{" "}
            of{" "}
            <span className="text-foreground">
              {paginationData.totalRecords}
            </span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem className="block sm:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <CaretDoubleLeftIcon aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem className="block sm:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <CaretLeftIcon aria-hidden="true" />
                </Button>
              </PaginationItem>

              {pageRange.map((page, index) =>
                page === "ellipsis" ? (
                  <PaginationItem
                    key={`ellipsis-${index}`}
                    className="hidden sm:block"
                  >
                    {editingIndex === index ? (
                      <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        autoFocus
                        className="w-16"
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => {
                          setEditingIndex(null);
                          setPageInputValue("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitPageInput();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingIndex(null);
                            setPageInputValue("");
                          }
                        }}
                        aria-label={`Go to page (1-${totalPages})`}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => {
                          setEditingIndex(index);
                          setPageInputValue("");
                        }}
                        aria-label="Enter a page number"
                      >
                        <PaginationEllipsis />
                      </Button>
                    )}
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page} className="hidden sm:block">
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        table.setPageIndex(page - 1);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem className="block sm:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <CaretRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem className="block sm:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <CaretDoubleRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
