import { DEFAULT_PAGINATION_QUERY } from "@/shared/constants/common";
import { PaginationQuery } from "@/shared/types/general";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface UsePaginationOptions {
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number;
}

interface UsePaginationReturn {
  pagination: PaginationQuery;
  setPagination: Dispatch<SetStateAction<PaginationQuery>>;
  keywordInput: string;
  setKeywordInput: Dispatch<SetStateAction<string>>;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const { debounceMs = 500 } = options;

  const [pagination, setPagination] = useState<PaginationQuery>(
    DEFAULT_PAGINATION_QUERY,
  );
  const [keywordInput, setKeywordInput] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      // A new keyword goes back to the first page; an unchanged one is a no-op.
      setPagination((prev) =>
        (prev.keyword ?? "") === keywordInput
          ? prev
          : { ...DEFAULT_PAGINATION_QUERY, keyword: keywordInput },
      );
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [keywordInput, debounceMs]);

  return { pagination, setPagination, keywordInput, setKeywordInput };
}
