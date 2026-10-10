import { formSchemaService } from "@/services/form-schema-service";
import { useQuery } from "@tanstack/react-query";
import { FieldValues } from "react-hook-form";

const FORM_SCHEMA_QUERY_KEYS = {
  all: ["form-schema"] as const,
  byKey: (key: string) => [...FORM_SCHEMA_QUERY_KEYS.all, key] as const,
} as const;

export const formSchemaQueries = {
  keys: FORM_SCHEMA_QUERY_KEYS,

  useByKey: <T extends FieldValues = FieldValues>(
    key: string,
    options?: { enabled?: boolean },
  ) =>
    useQuery({
      queryKey: formSchemaQueries.keys.byKey(key),
      queryFn: () => formSchemaService.getFormSchemaByKey<T>(key),
      enabled: (options?.enabled ?? true) && !!key,
    }),
};
