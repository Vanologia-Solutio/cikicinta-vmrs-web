import * as z from "zod";
import { Role } from "../types/role";

export const roleFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const defaultRoleFormValues: RoleFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
  isDefault: false,
};

export const defaultEditRoleValues = (entity: Role): RoleFormValues => ({
  code: entity.code,
  name: entity.name,
  description: entity.description ?? "",
  isActive: entity.isActive,
  isDefault: entity.isDefault,
});
