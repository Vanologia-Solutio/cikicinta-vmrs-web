"use client";

import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { formatSeparator } from "@/shared/utils/formatter";
import { ComponentProps, forwardRef } from "react";

type CurrencyInputProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  value?: string | number | null;
  onChange: (value: string) => void;
  showPrefix?: boolean;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    { value, onChange, showPrefix = true, ...props },
    ref,
  ) {
    const formattedValue = value ? formatSeparator(value) : "";
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.replace(/\D/g, ""));
    };

    if (!showPrefix) {
      return (
        <Input
          ref={ref}
          {...props}
          type="text"
          inputMode="numeric"
          value={formattedValue}
          onChange={handleChange}
        />
      );
    }

    return (
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>Rp</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          ref={ref}
          {...props}
          type="text"
          inputMode="numeric"
          value={formattedValue}
          onChange={handleChange}
        />
      </InputGroup>
    );
  },
);
