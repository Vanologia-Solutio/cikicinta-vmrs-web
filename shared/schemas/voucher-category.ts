import * as z from "zod";
import { VoucherCategory } from "../types/voucher-category";

export const voucherCategoryFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type VoucherCategoryFormValues = z.infer<
  typeof voucherCategoryFormSchema
>;

export const defaultVoucherCategoryFormValues: VoucherCategoryFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

export const defaultEditVoucherCategoryValues = (
  entity: VoucherCategory,
): VoucherCategoryFormValues => ({
  code: entity.code,
  name: entity.name,
  description: entity.description ?? "",
  isActive: entity.isActive,
});
