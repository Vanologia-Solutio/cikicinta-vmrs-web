"use client";

import { useEffect } from "react";
import { Control, FieldPath, FieldValues, useWatch } from "react-hook-form";

interface WatchFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  onChange: (value: unknown) => void;
}

export function WatchField<T extends FieldValues>({
  control,
  name,
  onChange,
}: WatchFieldProps<T>) {
  const value = useWatch({ control, name });

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return null;
}
