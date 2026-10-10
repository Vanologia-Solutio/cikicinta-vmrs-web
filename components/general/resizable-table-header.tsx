"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppFeatures } from "@/lib/table";
import { cn } from "@/lib/utils";
import {
  CaretDownIcon,
  CaretUpDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import {
  FlexRender,
  type Header,
  type RowData,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { Fragment, useState } from "react";
import type { Layout } from "react-resizable-panels";

// Columns narrower than this (action / icon / expand columns, e.g. `size: 12`)
// keep their width and get no drag handle.
const FIXED_COLUMN_MAX_SIZE = 48;
const MIN_RESIZABLE_PX = 64;

type AppHeader<T extends RowData> = Header<AppFeatures, T, unknown>;

function isFixedColumn<T extends RowData>(header: AppHeader<T>): boolean {
  return header.getSize() < FIXED_COLUMN_MAX_SIZE;
}

function computeDefaultLayout<T extends RowData>(
  headers: AppHeader<T>[],
): Record<string, number> {
  const total = headers.reduce((sum, header) => sum + header.getSize(), 0);
  const layout: Record<string, number> = {};
  let assigned = 0;
  headers.forEach((header, index) => {
    const isLast = index === headers.length - 1;
    const pct = isLast
      ? Number((100 - assigned).toFixed(2))
      : Number(((header.getSize() / total) * 100).toFixed(2));
    layout[header.column.id] = pct;
    assigned += pct;
  });
  return layout;
}

/**
 * Column widths for a table whose header is a ResizablePanelGroup. Widths are
 * kept as percentages of the table so the header panels and the table's
 * <colgroup> always line up. Layout resets when the set of columns changes.
 */
export function useResizableColumns<T extends RowData>(
  table: TanstackTable<AppFeatures, T>,
) {
  const headers = table.getLeafHeaders() as AppHeader<T>[];
  const key = headers.map((header) => header.column.id).join("|");
  const [state, setState] = useState<{ key: string; layout: Layout } | null>(
    null,
  );

  const defaults = computeDefaultLayout(headers);
  const layout = state?.key === key ? state.layout : undefined;

  return {
    headers,
    groupKey: key,
    defaults,
    minWidth: headers.reduce((sum, header) => sum + header.getSize(), 0),
    getWidthPercent: (columnId: string) =>
      layout?.[columnId] ?? defaults[columnId],
    onLayoutChange: (next: Layout) => setState({ key, layout: next }),
  };
}

function HeaderContent<T extends RowData>({
  header,
}: {
  header: AppHeader<T>;
}) {
  if (header.isPlaceholder) return null;

  if (!header.column.getCanSort()) {
    return <FlexRender header={header} />;
  }

  const sortState = header.column.getIsSorted();
  const SortIcon =
    sortState === "asc"
      ? CaretUpIcon
      : sortState === "desc"
        ? CaretDownIcon
        : CaretUpDownIcon;

  return (
    <div
      className={cn(
        "flex h-full min-w-0 cursor-pointer items-center justify-between gap-2 select-none",
        // Right-aligned: label next to the right edge, sort icon before it.
        header.column.columnDef.meta?.align === "right" &&
          "w-full flex-row-reverse justify-start",
      )}
      onClick={header.column.getToggleSortingHandler()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          header.column.getToggleSortingHandler()?.(e);
        }
      }}
      tabIndex={0}
    >
      <span className="min-w-0 truncate">
        <FlexRender header={header} />
      </span>
      <SortIcon className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
    </div>
  );
}

type ResizableColumns<T extends RowData> = ReturnType<
  typeof useResizableColumns<T>
>;

const ALIGN_CLASS = {
  left: "text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
} as const;

/** Cell/header classes for a column's `meta.align`. */
export function columnAlignClass(align?: "left" | "center" | "right") {
  return align ? ALIGN_CLASS[align] : undefined;
}

/** Visible header row: one resizable panel per column. */
export function ResizableHeaderRow<T extends RowData>({
  columns,
}: {
  columns: ResizableColumns<T>;
}) {
  const { headers, groupKey, defaults, onLayoutChange } = columns;

  return (
    <ResizablePanelGroup
      key={groupKey}
      orientation="horizontal"
      className="h-auto border-b bg-muted/75"
      onLayoutChange={onLayoutChange}
    >
      {headers.map((header, index) => {
        const fixed = isFixedColumn(header);
        const next = headers[index + 1];
        const showHandle = !fixed && next && !isFixedColumn(next);
        const size = header.getSize();

        return (
          <Fragment key={header.id}>
            <ResizablePanel
              id={header.column.id}
              defaultSize={`${defaults[header.column.id]}%`}
              minSize={`${fixed ? size : Math.min(size, MIN_RESIZABLE_PX)}px`}
              maxSize={fixed ? `${size}px` : undefined}
              disabled={fixed}
              groupResizeBehavior={
                fixed ? "preserve-pixel-size" : "preserve-relative-size"
              }
            >
              <div
                className={cn(
                  "flex h-full items-center overflow-hidden px-2 py-2.5 text-left text-xs font-medium whitespace-nowrap text-foreground",
                  columnAlignClass(header.column.columnDef.meta?.align),
                  fixed && "justify-center px-0",
                )}
              >
                <HeaderContent header={header} />
              </div>
            </ResizablePanel>
            {showHandle && (
              <ResizableHandle withHandle className="w-0 after:w-2" />
            )}
          </Fragment>
        );
      })}
    </ResizablePanelGroup>
  );
}

/**
 * Goes inside <Table style={{ tableLayout: "fixed" }}>: pins each column to the
 * panel layout and keeps a visually hidden real header for accessibility.
 */
export function ResizableTableColumns<T extends RowData>({
  columns,
}: {
  columns: ResizableColumns<T>;
}) {
  const { headers, getWidthPercent } = columns;

  return (
    <Fragment>
      <colgroup>
        {headers.map((header) => (
          <col
            key={header.id}
            style={{ width: `${getWidthPercent(header.column.id)}%` }}
          />
        ))}
      </colgroup>
      <TableHeader className="sr-only">
        <TableRow className="hover:bg-transparent">
          {headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : <FlexRender header={header} />}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    </Fragment>
  );
}
