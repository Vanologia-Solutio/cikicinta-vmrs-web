import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Horizontal alignment of the column's header and cells. Defaults to left. */
    align?: "left" | "center" | "right";
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
