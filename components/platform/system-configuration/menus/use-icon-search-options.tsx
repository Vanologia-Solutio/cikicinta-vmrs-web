"use client";

import { DynamicIcon, ICON_NAMES } from "@/components/general/icon";
import { useMemo, useState } from "react";

const MAX_RESULTS = 60;

/**
 * Search provider for the menu "icon" combobox: filters every phosphor icon
 * name client-side and previews each one next to its name.
 */
export function useIconSearchOptions() {
  const [keyword, setKeyword] = useState("");

  const options = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    const matches = needle
      ? ICON_NAMES.filter((name) => name.toLowerCase().includes(needle))
      : ICON_NAMES;
    return matches
      .slice(0, MAX_RESULTS)
      .map((name) => ({ value: name, label: name }));
  }, [keyword]);

  return {
    options,
    isLoading: false,
    onKeywordChange: setKeyword,
    renderOption: (option: { value: string; label: string }) => (
      <span className="flex min-w-0 items-center gap-2">
        <DynamicIcon name={option.value} className="size-4 shrink-0" />
        <span className="truncate">{option.label}</span>
      </span>
    ),
  };
}
