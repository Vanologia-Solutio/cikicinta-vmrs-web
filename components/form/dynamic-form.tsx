"use client";

import { cn } from "@/lib/utils";
import {
  FieldConfig,
  FieldOption,
  OptionsMap,
  SearchOptions,
} from "@/shared/types/form";
import { getReadableFileSize } from "@/shared/utils/data";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CloudArrowUpIcon,
  FileMagnifyingGlassIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { Fragment, ReactNode, useEffect } from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  DefaultValues,
  FieldValues,
  Resolver,
  SubmitHandler,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { ComboboxMultipleExpandable } from "./combobox-multiple-expandable";
import { ComboboxSearch } from "./combobox-search";
import { CurrencyInput } from "./currency-input";
import { FormDialogFooter } from "./form-dialog-footer";
import { NumberInput } from "./number-input";

interface DynamicFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues: T;
  fields: FieldConfig<T>[][];
  onSubmit: SubmitHandler<T>;
  loading?: boolean;
  footer?: ReactNode;
  formId?: string;
  rowClassName?: string;
  options?: Record<string, unknown[]>;
  optionsMap?: OptionsMap;
  searchOptions?: SearchOptions;
  modal?: boolean;
  onFormReady?: (form: UseFormReturn<T>) => void;
}

interface SelectOptionsContext {
  options?: Record<string, unknown[]>;
  optionsMap?: OptionsMap;
  searchOptions?: SearchOptions;
}

const DEFAULT_OPTIONS_MAP: OptionsMap = {
  valueKey: "value",
  labelKey: "label",
};

/** Value of the "no selection" item added to a select with `props.clearable`. */
const CLEAR_VALUE = "";

function getOptionsMap(
  context: SelectOptionsContext,
  field: { valueKey?: string; labelKey?: string },
): OptionsMap {
  const map = context.optionsMap ?? DEFAULT_OPTIONS_MAP;
  return {
    valueKey: field.valueKey ?? map.valueKey,
    labelKey: field.labelKey ?? map.labelKey,
  };
}

function mapRawToFieldOptions(
  raw: unknown[],
  valueKey: string,
  labelKey: string,
): FieldOption[] {
  return raw.map((item) => {
    const rec = item as Record<string, unknown>;
    return {
      value: rec[valueKey] as string | number | null,
      label: String(rec[labelKey] ?? ""),
    };
  });
}

function toComboboxOptions(
  opts: FieldOption[],
): { value: string; label: string }[] {
  return opts.map((o) => ({ value: String(o.value ?? ""), label: o.label }));
}

function getSelectOptions(
  optionsKey: string | undefined,
  context: SelectOptionsContext,
  field: { valueKey?: string; labelKey?: string },
): FieldOption[] {
  if (!optionsKey || !context.options?.[optionsKey]) return [];
  const raw = context.options[optionsKey] as unknown[];
  const { valueKey, labelKey } = getOptionsMap(context, field);
  return mapRawToFieldOptions(raw, valueKey, labelKey);
}

function renderComponent<T extends FieldValues>(
  field: FieldConfig<T>,
  controllerField: ControllerRenderProps<T>,
  fieldState: ControllerFieldState,
  disabled: boolean,
  selectContext: SelectOptionsContext,
) {
  const {
    type: inputType,
    clearable,
    disabled: fieldDisabled,
    ...restFieldProps
  } = (field.props ?? {}) as {
    type?: string;
    clearable?: boolean;
    disabled?: boolean;
    [k: string]: unknown;
  };
  const id = String(controllerField.name);
  const isDisabled = disabled || Boolean(fieldDisabled);
  const sharedProps = {
    ...controllerField,
    disabled: isDisabled,
    "aria-invalid": fieldState.invalid,
    placeholder: field.placeholder,
    ...restFieldProps,
    id,
    name: id,
  };

  switch (field.componentType) {
    case "input":
      return (
        <Input
          type={inputType ?? "text"}
          {...sharedProps}
          value={controllerField.value ?? ""}
        />
      );

    case "input-number":
      return (
        <NumberInput
          {...sharedProps}
          value={controllerField.value}
          onChange={controllerField.onChange}
        />
      );

    case "currency":
      return (
        <CurrencyInput
          {...sharedProps}
          value={controllerField.value}
          onChange={controllerField.onChange}
        />
      );

    case "textarea":
      return <Textarea {...sharedProps} value={controllerField.value ?? ""} />;

    case "code":
      return (
        <Textarea
          className="font-mono"
          {...sharedProps}
          value={controllerField.value ?? ""}
        />
      );

    case "datepicker": {
      const rawDateValue = controllerField.value as unknown;
      const selectedDate =
        rawDateValue instanceof Date ? rawDateValue : undefined;

      return (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                id={id}
                type="button"
                variant="outline"
                className="justify-start font-normal"
                disabled={isDisabled}
                aria-invalid={fieldState.invalid}
              />
            }
          >
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span className="text-muted-foreground">
                {field.placeholder ?? "Pick a date"}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={controllerField.onChange}
              defaultMonth={selectedDate}
              disabled={isDisabled}
            />
          </PopoverContent>
        </Popover>
      );
    }

    case "select": {
      const opts = getSelectOptions(field.options, selectContext, field);
      // Base UI resolves the trigger label from `items`, so ids render as names.
      const items = [
        ...(clearable
          ? [{ value: CLEAR_VALUE, label: field.placeholder ?? "None" }]
          : []),
        ...opts.map((opt) => ({
          value: String(opt.value ?? ""),
          label: opt.label,
        })),
      ];
      const current =
        controllerField.value === undefined || controllerField.value === null
          ? ""
          : String(controllerField.value);

      return (
        <Select
          items={items}
          name={id}
          value={current === "" && !clearable ? null : current}
          onValueChange={(next) => controllerField.onChange(next ?? "")}
          disabled={isDisabled}
        >
          <SelectTrigger
            id={id}
            className="w-full"
            aria-invalid={fieldState.invalid}
            onBlur={controllerField.onBlur}
          >
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "radio-group": {
      const opts = getSelectOptions(field.options, selectContext, field);
      return (
        <RadioGroup
          name={id}
          value={controllerField.value ?? ""}
          onValueChange={(next) => controllerField.onChange(next)}
          disabled={isDisabled}
        >
          {opts.map((opt) => (
            <div key={String(opt.value)} className="flex items-center gap-2">
              <RadioGroupItem
                id={`${id}-${String(opt.value)}`}
                value={String(opt.value)}
                aria-invalid={fieldState.invalid}
              />
              <Label htmlFor={`${id}-${String(opt.value)}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    case "combobox-search": {
      const optionsKey = field.options;
      const searchOpts =
        selectContext.searchOptions?.[id] ??
        (optionsKey ? selectContext.searchOptions?.[optionsKey] : undefined);
      if (!searchOpts) return null;

      const { valueKey, labelKey } = getOptionsMap(selectContext, field);
      const mappedOptions =
        searchOpts.options ??
        mapRawToFieldOptions(searchOpts.rawOptions ?? [], valueKey, labelKey);

      return (
        <ComboboxSearch
          id={id}
          value={controllerField.value ?? null}
          onChange={(next) => controllerField.onChange(next ?? "")}
          disabled={isDisabled}
          aria-invalid={fieldState.invalid}
          placeholder={field.placeholder}
          options={toComboboxOptions(mappedOptions)}
          isLoading={searchOpts.isLoading}
          onSearchKeywordChange={searchOpts.onKeywordChange}
          renderOption={searchOpts.renderOption}
        />
      );
    }

    case "multiselect": {
      const opts = getSelectOptions(field.options, selectContext, field);
      return (
        <ComboboxMultipleExpandable
          items={opts.map((o) => ({ value: String(o.value), label: o.label }))}
          selectedValues={
            Array.isArray(controllerField.value) ? controllerField.value : []
          }
          setSelectedValues={(updater) => {
            const next =
              typeof updater === "function"
                ? updater(
                    Array.isArray(controllerField.value)
                      ? controllerField.value
                      : [],
                  )
                : updater;
            controllerField.onChange(next);
          }}
          disabled={isDisabled}
          aria-invalid={fieldState.invalid}
          placeholder={field.placeholder}
        />
      );
    }

    case "switch":
      return (
        <Switch
          id={id}
          name={id}
          checked={Boolean(controllerField.value)}
          onCheckedChange={(checked) => controllerField.onChange(checked)}
          disabled={isDisabled}
          aria-invalid={fieldState.invalid}
        />
      );

    case "checkbox":
      return (
        <Checkbox
          id={id}
          name={id}
          checked={Boolean(controllerField.value)}
          onCheckedChange={(checked) => controllerField.onChange(checked)}
          disabled={isDisabled}
          aria-invalid={fieldState.invalid}
        />
      );

    case "file": {
      const fileList = controllerField.value as FileList | undefined;
      const selectedFile = fileList?.[0];
      const isImage = selectedFile?.type.startsWith("image/");

      return (
        <div className="flex w-full flex-col gap-2">
          <Label
            aria-invalid={fieldState.invalid}
            className={cn(
              "flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-2 transition hover:border-muted-foreground/50 hover:bg-muted/40 aria-invalid:border-destructive",
              isDisabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <CloudArrowUpIcon className="size-6" />
              <span className="font-medium">
                {selectedFile
                  ? selectedFile.name
                  : "Click to upload or drag and drop"}
              </span>
              <span className="text-muted-foreground">
                {selectedFile
                  ? getReadableFileSize(selectedFile.size)
                  : (field.placeholder ?? "PDF, DOCX, or images")}
              </span>
            </div>
            <Input
              id={id}
              name={id}
              type="file"
              className="hidden"
              disabled={isDisabled}
              onBlur={controllerField.onBlur}
              onChange={(e) => controllerField.onChange(e.target.files)}
            />
          </Label>

          {selectedFile && (
            <div className="flex gap-2">
              {isImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDisabled}
                  onClick={() =>
                    window.open(URL.createObjectURL(selectedFile), "_blank")
                  }
                >
                  <FileMagnifyingGlassIcon />
                  Preview
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => controllerField.onChange(undefined)}
                disabled={isDisabled}
              >
                <XCircleIcon />
                Remove
              </Button>
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

export function DynamicFormSkeleton({
  rows = 1,
  cols = 1,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

function getRowGridCols<T extends FieldValues>(row: FieldConfig<T>[]): number {
  return row.reduce((sum, field) => sum + (field.colSpan ?? 1), 0);
}

export function DynamicForm<T extends FieldValues>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  loading = false,
  footer,
  formId = "dynamic-form",
  rowClassName,
  options,
  optionsMap,
  searchOptions,
  modal = false,
  onFormReady,
}: DynamicFormProps<T>) {
  const formOptions: UseFormProps<T> = {
    resolver: zodResolver(
      schema as Parameters<typeof zodResolver>[0],
    ) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
  };
  const form = useForm<T>(formOptions);

  useEffect(() => {
    onFormReady?.(form);
  }, [form, onFormReady]);

  const selectContext: SelectOptionsContext = {
    options,
    optionsMap,
    searchOptions,
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
      <FieldGroup className="mb-4">
        {fields.map((row, rowIndex) => {
          const attachToPrevious =
            rowIndex > 0 && row.length === 1 && !row[0].label;
          return (
            <div
              key={rowIndex}
              className={cn(
                rowClassName ? `grid gap-4 ${rowClassName}` : "grid gap-4",
                attachToPrevious && "-mt-5",
              )}
              style={
                !rowClassName && row.length > 0
                  ? {
                      gridTemplateColumns: `repeat(${getRowGridCols(row)}, minmax(0, 1fr))`,
                    }
                  : undefined
              }
            >
              {row.map((fieldConfig) => (
                <Controller<T>
                  key={String(fieldConfig.name)}
                  control={form.control}
                  name={fieldConfig.name}
                  render={({ field: controllerField, fieldState }) => {
                    const isHorizontal =
                      fieldConfig.fieldProps?.orientation === "horizontal";
                    const isToggle =
                      fieldConfig.componentType === "switch" ||
                      fieldConfig.componentType === "checkbox";
                    const renderField = renderComponent(
                      fieldConfig,
                      controllerField,
                      fieldState,
                      loading,
                      selectContext,
                    );

                    return (
                      <Field
                        style={
                          fieldConfig.colSpan
                            ? { gridColumn: `span ${fieldConfig.colSpan}` }
                            : undefined
                        }
                        orientation={fieldConfig.fieldProps?.orientation}
                        data-invalid={fieldState.invalid}
                      >
                        {isHorizontal && isToggle ? (
                          <Fragment>
                            {renderField}
                            <FieldLabel htmlFor={String(fieldConfig.name)}>
                              {fieldConfig.label}
                            </FieldLabel>
                          </Fragment>
                        ) : (
                          <Fragment>
                            <FieldLabel htmlFor={String(fieldConfig.name)}>
                              {fieldConfig.label}
                            </FieldLabel>
                            {renderField}
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Fragment>
                        )}
                      </Field>
                    );
                  }}
                />
              ))}
            </div>
          );
        })}
      </FieldGroup>
      {modal ? (
        <FormDialogFooter formId={formId} isLoading={loading} />
      ) : (
        footer
      )}
    </form>
  );
}
