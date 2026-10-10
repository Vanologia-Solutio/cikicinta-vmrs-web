import type { ReactNode } from "react";
import { FieldValues, Path } from "react-hook-form";

type FieldType =
  | "input"
  | "input-number"
  | "currency"
  | "datepicker"
  | "textarea"
  | "code"
  | "select"
  | "radio-group"
  | "multiselect"
  | "combobox-search"
  | "switch"
  | "checkbox"
  | "file";

export interface FieldOption {
  value: string | number | null;
  label: string;
}

export interface OptionsMap {
  valueKey: string;
  labelKey: string;
}

interface SearchOptionsProvider {
  options?: FieldOption[];
  rawOptions?: unknown[];
  isLoading: boolean;
  onKeywordChange: (keyword: string) => void;
  /** Custom content for an option row and the selected value (e.g. an icon preview). */
  renderOption?: (option: { value: string; label: string }) => ReactNode;
}

export type SearchOptions = Record<string, SearchOptionsProvider>;

export interface FieldConfig<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  componentType: FieldType;
  placeholder?: string;
  options?: string;
  valueKey?: string;
  labelKey?: string;
  colSpan?: number;
  props?: Record<string, unknown>;
  fieldProps?: {
    orientation?: "horizontal" | "vertical";
  };
}

export interface FormSchema<T extends FieldValues = FieldValues> {
  id: string;
  key: string;
  fields: FieldConfig<T>[][];
}
