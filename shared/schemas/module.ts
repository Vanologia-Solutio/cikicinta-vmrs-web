import * as z from "zod";
import { PlatformModule } from "../types/module";
import { localeStringToNumber } from "../utils/formatter";

export const moduleFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  // NumberInput emits a locale-formatted string; edit defaults are numbers.
  sequence: z
    .union([z.string(), z.number()])
    .transform((v) => localeStringToNumber(v))
    .refine((v) => Number.isFinite(v) && v >= 0, "Sequence must be a number"),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const defaultModuleFormValues: ModuleFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
  sequence: 0,
};

export const defaultEditModuleValues = (
  entity: PlatformModule,
): ModuleFormValues => ({
  code: entity.code,
  name: entity.name,
  description: entity.description ?? "",
  isActive: entity.isActive,
  sequence: Number(entity.sequence),
});
