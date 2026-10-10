import { DynamicIcon } from "@/components/general/icon";
import { cn } from "@/lib/utils";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

interface SearchBarProps {
  keywordInput: string;
  setKeywordInput: Dispatch<SetStateAction<string>>;
  className?: string;
  icon?: string;
  totalRecords?: number;
  placeholder?: string;
}

export function SearchBar({
  keywordInput,
  setKeywordInput,
  className,
  icon,
  totalRecords,
  placeholder,
}: SearchBarProps) {
  return (
    <div
      className={cn("mb-4 flex w-full max-w-md items-center gap-2", className)}
    >
      <InputGroup className="min-w-0 flex-1">
        <InputGroupInput
          placeholder={placeholder ?? "Search..."}
          value={keywordInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setKeywordInput(e.target.value)
          }
        />
        <InputGroupAddon>
          <DynamicIcon name={icon ?? "MagnifyingGlass"} />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {totalRecords ?? 0} results
        </InputGroupAddon>
      </InputGroup>
      {/* The table below portals its "Columns" menu in here (see table-columns-toggle). */}
      <div data-table-columns-slot="" className="shrink-0 empty:hidden" />
    </div>
  );
}
