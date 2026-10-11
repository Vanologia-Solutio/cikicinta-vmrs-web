import * as z from "zod";
import { VoucherBenefit } from "../types/voucher-benefit";

export const voucherBenefitFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters")
    .transform((v) => v.toUpperCase()),
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be at most 120 characters"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1, "Category is required"),
});

export type VoucherBenefitFormValues = z.infer<typeof voucherBenefitFormSchema>;

export const defaultVoucherBenefitFormValues: VoucherBenefitFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
  categoryId: "",
};

export const defaultEditVoucherBenefitValues = (
  entity: VoucherBenefit,
): VoucherBenefitFormValues => ({
  code: entity.code,
  name: entity.name,
  description: entity.description ?? "",
  isActive: entity.isActive,
  categoryId: entity.category?.id ?? "",
});
