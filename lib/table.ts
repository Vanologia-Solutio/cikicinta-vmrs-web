import {
  columnSizingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  createTableHook,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type ColumnDef,
} from "@tanstack/react-table";

/**
 * Feature set shared by every data table in the app (TanStack Table v9).
 * Pagination is server-side (`manualPagination` + `rowCount`); sorting is
 * client-side over the current page. Column drag-resize is handled by
 * react-resizable-panels, so only sizing (not resizing) is registered.
 */
export const appTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  rowSelectionFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export type AppFeatures = typeof appTableFeatures;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppColumnDef<T extends Record<string, any>> = ColumnDef<
  AppFeatures,
  T
>;

export const { useAppTable, createAppColumnHelper } = createTableHook({
  features: appTableFeatures,
});
