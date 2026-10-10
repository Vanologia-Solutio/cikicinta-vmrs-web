"use client";

import { Input } from "@/components/ui/input";
import {
  formatLocaleNumberInput,
  sanitizeLocaleNumberInput,
} from "@/shared/utils/formatter";
import { ComponentProps, forwardRef } from "react";

type NumberInputProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  value?: string | number | null;
  onChange: (value: string) => void;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onChange, ...props }, ref) {
    const hasValue = value !== null && value !== undefined && value !== "";

    return (
      <Input
        ref={ref}
        {...props}
        type="text"
        inputMode="decimal"
        value={hasValue ? formatLocaleNumberInput(String(value)) : ""}
        onChange={(e) => onChange(sanitizeLocaleNumberInput(e.target.value))}
      />
    );
  },
);
