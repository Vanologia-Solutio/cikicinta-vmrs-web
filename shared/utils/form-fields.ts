import { FieldConfig } from "@/shared/types/form";
import { FieldValues } from "react-hook-form";

export function withHiddenFields<T extends FieldValues>(
  fields: FieldConfig<T>[][],
  fieldNames: string[],
  hidden: boolean,
): FieldConfig<T>[][] {
  if (!hidden) return fields;
  return fields
    .map((row) =>
      row.filter((field) => !fieldNames.includes(field.name as string)),
    )
    .filter((row) => row.length > 0);
}

export function withDisabledFields<T extends FieldValues>(
  fields: FieldConfig<T>[][],
  fieldNames: string[],
  disabled: boolean,
): FieldConfig<T>[][] {
  if (!disabled) return fields;
  return fields.map((row) =>
    row.map((field) =>
      fieldNames.includes(field.name as string)
        ? { ...field, props: { ...field.props, disabled: true } }
        : field,
    ),
  );
}
