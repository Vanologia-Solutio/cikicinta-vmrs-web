"use client";

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
import {
  CaretUpDownIcon,
  MagnifyingGlassIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

const DEBOUNCE_MS = 500;
const MIN_KEYWORD_LENGTH = 0;

export interface ComboboxSearchOption {
  value: string;
  label: string;
}

export interface ComboboxSearchProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options?: ComboboxSearchOption[];
  isLoading?: boolean;
  onSearchKeywordChange?: (keyword: string) => void;
  fetchOptions?: (keyword: string) => Promise<ComboboxSearchOption[]>;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  emptyMessage?: string;
  minKeywordLength?: number;
  debounceMs?: number;
  className?: string;
  id?: string;
  /** Label shown for `value` while it is not among the loaded options (e.g. a saved value on an edit form). */
  selectedLabel?: string;
  /** Custom row / trigger content for an option (e.g. an icon preview). */
  renderOption?: (option: ComboboxSearchOption) => ReactNode;
}

function useDebounce<T>(
  value: T,
  delay: number,
  onDebounced?: (debounced: T) => void,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const onDebouncedRef = useRef(onDebounced);
  useEffect(() => {
    onDebouncedRef.current = onDebounced;
  }, [onDebounced]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      onDebouncedRef.current?.(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function ComboboxSearch({
  value,
  onChange,
  options: controlledOptions,
  isLoading: controlledLoading = false,
  onSearchKeywordChange,
  fetchOptions,
  placeholder = "Search...",
  disabled = false,
  "aria-invalid": ariaInvalid,
  emptyMessage = "No results found.",
  minKeywordLength = MIN_KEYWORD_LENGTH,
  debounceMs = DEBOUNCE_MS,
  className,
  id: idProp,
  selectedLabel,
  renderOption,
}: ComboboxSearchProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [inputValue, setInputValue] = useState("");
  const [internalOptions, setInternalOptions] = useState<
    ComboboxSearchOption[]
  >([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const [pickedOption, setPickedOption] = useState<ComboboxSearchOption | null>(
    null,
  );

  const controlled = controlledOptions !== undefined;

  const runSearch = useCallback(
    async (keyword: string) => {
      if (!fetchOptions || keyword.length < minKeywordLength) return;
      setInternalLoading(true);
      try {
        const result = await fetchOptions(keyword);
        if (openRef.current) setInternalOptions(result);
      } catch {
        if (openRef.current) setInternalOptions([]);
      } finally {
        if (openRef.current) setInternalLoading(false);
      }
    },
    [fetchOptions, minKeywordLength],
  );

  const handleDebouncedKeyword = useCallback(
    (keyword: string) => {
      if (controlled) {
        onSearchKeywordChange?.(keyword);
        return;
      }
      if (!openRef.current || keyword.length < minKeywordLength) return;
      void runSearch(keyword);
    },
    [controlled, minKeywordLength, onSearchKeywordChange, runSearch],
  );

  const debouncedKeyword = useDebounce(
    inputValue.trim(),
    debounceMs,
    handleDebouncedKeyword,
  );

  const options = useMemo(() => {
    if (controlled) return controlledOptions!;
    if (debouncedKeyword.length < minKeywordLength) return [];
    return internalOptions;
  }, [
    controlled,
    controlledOptions,
    debouncedKeyword,
    minKeywordLength,
    internalOptions,
  ]);
  const isLoading = controlled ? controlledLoading : internalLoading;

  const selectedOption = useMemo(() => {
    if (value == null || value === "") return null;
    const found = options.find((o) => o.value === value);
    if (found) return found;
    if (pickedOption?.value === value) return pickedOption;
    return null;
  }, [value, options, pickedOption]);

  const handleSelect = (option: ComboboxSearchOption) => {
    onChange(option.value);
    setPickedOption(option);
    setInputValue("");
    if (!controlled) setInternalOptions([]);
    openRef.current = false;
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    openRef.current = next;
    setOpen(next);
    if (!next) {
      setInputValue("");
      if (!controlled) setInternalOptions([]);
      return;
    }
    if (!controlled && debouncedKeyword.length >= minKeywordLength) {
      void runSearch(debouncedKeyword);
    }
  };

  const displayOption: ComboboxSearchOption | null =
    selectedOption ??
    (value ? { value, label: selectedLabel ?? String(value) } : null);

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal>
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
            className={cn("w-full justify-between font-normal", className)}
          />
        }
      >
        <span
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1.5 truncate text-left",
            !displayOption && "text-muted-foreground",
          )}
        >
          {displayOption
            ? (renderOption?.(displayOption) ?? displayOption.label)
            : placeholder}
        </span>
        <CaretUpDownIcon
          className="shrink-0 text-muted-foreground/80"
          aria-hidden="true"
        />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-56 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={
              minKeywordLength > 0
                ? `Type ${minKeywordLength}+ characters to search...`
                : "Search your keyword here"
            }
            value={inputValue}
            onValueChange={setInputValue}
            autoComplete="off"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <SpinnerGapIcon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Fragment>
                <CommandEmpty>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MagnifyingGlassIcon />
                      </EmptyMedia>
                      <EmptyTitle>No results found.</EmptyTitle>
                      <EmptyDescription>
                        {debouncedKeyword.length < minKeywordLength
                          ? `Type ${minKeywordLength}+ characters to search`
                          : emptyMessage}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => handleSelect(opt)}
                    >
                      {renderOption?.(opt) ?? opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Fragment>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
