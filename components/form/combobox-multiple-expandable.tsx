"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretUpDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Dispatch, Fragment, SetStateAction, useId, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface ComboboxMultipleExpandableProps {
  items: Option[];
  selectedValues: string[];
  setSelectedValues: Dispatch<SetStateAction<string[]>>;
  maxShownItems?: number;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
}

export function ComboboxMultipleExpandable({
  items,
  selectedValues,
  setSelectedValues,
  maxShownItems = 2,
  placeholder = "Select items",
  disabled = false,
  "aria-invalid": ariaInvalid,
  className,
}: ComboboxMultipleExpandableProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleSelection = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const removeSelection = (value: string) => {
    setSelectedValues((prev) => prev.filter((v) => v !== value));
  };

  const visibleItems = expanded
    ? selectedValues
    : selectedValues.slice(0, maxShownItems);
  const hiddenCount = selectedValues.length - visibleItems.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            disabled={disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className={cn(
              "h-auto min-h-7 w-full justify-between py-1 font-normal",
              className,
            )}
          />
        }
      >
        <div className="flex flex-wrap items-center gap-1 pr-2.5">
          {selectedValues.length > 0 ? (
            <Fragment key={id}>
              {visibleItems.map((val) => {
                const item = items.find((c) => c.value === val);

                return item ? (
                  <Badge key={val} variant="outline">
                    {item.label}
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remove ${item.label}`}
                      className="inline-flex size-3 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelection(val);
                      }}
                    >
                      <XIcon />
                    </span>
                  </Badge>
                ) : null;
              })}
              {hiddenCount > 0 || expanded ? (
                <Badge
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => !prev);
                  }}
                >
                  {expanded ? "Show Less" : `+${hiddenCount} more`}
                </Badge>
              ) : null}
            </Fragment>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <CaretUpDownIcon
          className="shrink-0 text-muted-foreground/80"
          aria-hidden="true"
        />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-56 p-0">
        <Command>
          <CommandInput placeholder={placeholder} autoComplete="off" />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => toggleSelection(item.value)}
                >
                  <span className="truncate">{item.label}</span>
                  {selectedValues.includes(item.value) && (
                    <CheckIcon className="ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
