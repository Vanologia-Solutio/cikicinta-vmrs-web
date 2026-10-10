import * as z from "zod";
import { Tenant } from "../types/tenant";

export const tenantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z
    .string()
    .optional()
    .transform((v) => v?.toUpperCase()),
  type: z.string().min(1, "Type is required"),
  timezone: z.string().min(1, "Timezone is required"),
  isActive: z.boolean().default(true),
  initializeDefaultAccessControl: z.boolean().default(false),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

export const defaultTenantFormValues: TenantFormValues = {
  name: "",
  code: "",
  type: "",
  timezone: "Asia/Jakarta",
  isActive: true,
  initializeDefaultAccessControl: false,
};

export const defaultEditTenantValues = (tenant: Tenant): TenantFormValues => ({
  name: tenant.name,
  code: tenant.code ?? "",
  type: tenant.type,
  timezone: tenant.timezone ?? "",
  isActive: tenant.isActive,
  initializeDefaultAccessControl: tenant.initializeDefaultAccessControl,
});
