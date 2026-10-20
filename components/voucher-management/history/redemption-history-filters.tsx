"use client";

import { DynamicIcon } from "@/components/general/icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { masterDataQueries } from "@/hooks/use-master-data";
import { VoucherRedemptionFilters } from "@/shared/types/voucher-redemption";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

const ANY = "";
const API_DATE_FORMAT = "yyyy-MM-dd";
const LABEL_DATE_FORMAT = "dd MMM yyyy";

interface RedemptionHistoryFiltersProps {
  filters: VoucherRedemptionFilters;
  onChange: (filters: VoucherRedemptionFilters) => void;
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value?: string;
  options: { id: string; name: string }[];
  onChange: (value?: string) => void;
}) {
  // Base UI resolves the trigger label from `items`, so ids render as names.
  const items = [
    { value: ANY, label: allLabel },
    ...options.map((opt) => ({ value: opt.id, label: opt.name })),
  ];
  return (
    <Select
      items={items}
      value={value ?? ANY}
      onValueChange={(next) => onChange(next || undefined)}
    >
      <SelectTrigger className="w-44" aria-label={label}>
        <SelectValue />
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

function rangeLabel(startDate?: string, endDate?: string) {
  if (!startDate) return null;
  const start = format(parseISO(startDate), LABEL_DATE_FORMAT);
  if (!endDate || endDate === startDate) return start;
  return `${start} - ${format(parseISO(endDate), LABEL_DATE_FORMAT)}`;
}

/** Category, benefit and redeemed-at date range for the history table. */
export function RedemptionHistoryFilters({
  filters,
  onChange,
}: RedemptionHistoryFiltersProps) {
  const { categoryId, benefitId, startDate, endDate } = filters;
  const { data: categories } = masterDataQueries.useActiveVoucherCategories();
  // Narrowed to the chosen category, so every benefit offered can match.
  const { data: benefits } = masterDataQueries.useActiveVoucherBenefits({
    categoryId,
  });

  const selectedRange: DateRange | undefined = startDate
    ? {
        from: parseISO(startDate),
        to: endDate ? parseISO(endDate) : undefined,
      }
    : undefined;
  const label = rangeLabel(startDate, endDate);
  const hasFilters = Boolean(categoryId || benefitId || startDate);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Category"
        allLabel="All categories"
        value={categoryId}
        options={categories?.data ?? []}
        // A benefit belongs to one category, so a new category drops it.
        onChange={(next) =>
          onChange({ ...filters, categoryId: next, benefitId: undefined })
        }
      />
      <FilterSelect
        label="Benefit"
        allLabel="All benefits"
        value={benefitId}
        options={benefits?.data ?? []}
        onChange={(next) => onChange({ ...filters, benefitId: next })}
      />
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="justify-start font-normal"
              aria-label="Redeemed at"
            />
          }
        >
          <DynamicIcon name="CalendarBlank" />
          {label ?? (
            <span className="text-muted-foreground">Any redeemed date</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={selectedRange}
            defaultMonth={selectedRange?.from}
            disabled={{ after: new Date() }}
            onSelect={(range) =>
              onChange({
                ...filters,
                startDate: range?.from
                  ? format(range.from, API_DATE_FORMAT)
                  : undefined,
                // One picked day is a range of that day alone.
                endDate: range?.from
                  ? format(range.to ?? range.from, API_DATE_FORMAT)
                  : undefined,
              })
            }
          />
        </PopoverContent>
      </Popover>
      {hasFilters && (
        <Button variant="ghost" onClick={() => onChange({})}>
          <DynamicIcon name="X" />
          Reset
        </Button>
      )}
    </div>
  );
}
