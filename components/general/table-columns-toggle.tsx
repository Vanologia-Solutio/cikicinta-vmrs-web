"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { AppFeatures } from "@/lib/table";
import {
  ArrowsClockwiseIcon,
  ColumnsIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import type { Column, RowData, Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

/** SearchBar renders an element with this attribute; the nearest table claims it. */
const COLUMNS_SLOT_ATTRIBUTE = "data-table-columns-slot";
const SLOT_SELECTOR = `[${COLUMNS_SLOT_ATTRIBUTE}]`;
const CLAIMED_ATTRIBUTE = "data-claimed";
const MAX_ANCESTOR_DEPTH = 4;

// Columns that are structural, not data (selection checkbox, row expander).
const NON_HIDEABLE_COLUMN_IDS = new Set(["select", "__expand"]);

type AppColumn<T extends RowData> = Column<AppFeatures, T, unknown>;

/**
 * Walks up from the table, checking each level's preceding siblings, for the
 * first unclaimed SearchBar slot. Pages put the SearchBar right above their
 * table, so the nearest free slot is the table's own.
 */
function findFreeSlot(anchor: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = anchor;
  for (let depth = 0; node && depth < MAX_ANCESTOR_DEPTH; depth += 1) {
    let sibling: Element | null = node.previousElementSibling;
    while (sibling) {
      const slot = sibling.matches(SLOT_SELECTOR)
        ? sibling
        : sibling.querySelector(SLOT_SELECTOR);
      if (slot && !slot.hasAttribute(CLAIMED_ATTRIBUTE)) {
        return slot as HTMLElement;
      }
      sibling = sibling.previousElementSibling;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * `slot`: undefined while locating, the SearchBar's slot element once found,
 * null when the page has no SearchBar for this table (menu renders inline).
 */
export function useColumnsToggleSlot() {
  const [slot, setSlot] = useState<HTMLElement | null | undefined>(undefined);

  const anchorRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const found = findFreeSlot(node);
    if (!found) {
      setSlot(null);
      return;
    }
    found.setAttribute(CLAIMED_ATTRIBUTE, "");
    setSlot(found);
    return () => found.removeAttribute(CLAIMED_ATTRIBUTE);
  }, []);

  return { anchorRef, slot };
}

function columnLabel<T extends RowData>(column: AppColumn<T>): string {
  const header = column.columnDef.header;
  if (typeof header === "string") return header.trim();
  return column.id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function isToggleable<T extends RowData>(column: AppColumn<T>): boolean {
  return (
    column.getCanHide() &&
    !NON_HIDEABLE_COLUMN_IDS.has(column.id) &&
    columnLabel(column) !== ""
  );
}

function ColumnsMenu<T extends RowData>({
  table,
}: {
  table: Table<AppFeatures, T>;
}) {
  const [search, setSearch] = useState("");

  const columns = (table.getAllLeafColumns() as AppColumn<T>[]).filter(
    isToggleable,
  );
  if (columns.length === 0) return null;

  const visibleCount = columns.filter((column) => column.getIsVisible()).length;
  const keyword = search.trim().toLowerCase();

  return (
    <DropdownMenu onOpenChange={(open) => !open && setSearch("")}>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" />}>
        <ColumnsIcon />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-56">
        <div className="relative p-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
            placeholder="Search"
            aria-label="Search columns"
            onKeyDown={(e) => e.stopPropagation()}
          />
          <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 my-auto size-3.5 text-muted-foreground" />
        </div>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const label = columnLabel(column);
          if (keyword && !label.toLowerCase().includes(keyword)) return null;

          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              // Keep at least one column on screen.
              disabled={column.getIsVisible() && visibleCount <= 1}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              closeOnClick={false}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          closeOnClick={false}
          onClick={() => {
            table.resetColumnVisibility();
            setSearch("");
          }}
        >
          <ArrowsClockwiseIcon />
          Reset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Column visibility menu for PaginatedDataTable. Shown next to the page's
 * SearchBar when there is one, otherwise right-aligned above the table.
 */
export function TableColumnsToggle<T extends RowData>({
  table,
  slot,
}: {
  table: Table<AppFeatures, T>;
  slot: HTMLElement | null | undefined;
}) {
  if (slot === undefined) return null;
  if (slot) return createPortal(<ColumnsMenu table={table} />, slot);
  return (
    <div className="flex justify-end">
      <ColumnsMenu table={table} />
    </div>
  );
}
