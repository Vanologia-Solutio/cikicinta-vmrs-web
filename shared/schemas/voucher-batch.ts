import { format, parseISO } from "date-fns";
import * as z from "zod";
import { VoucherBatch } from "../types/voucher-batch";

export const MAX_VOUCHERS_PER_BATCH = 10000;

export const toApiDate = (date: Date) => format(date, "yyyy-MM-dd");

const validityShape = {
  validFrom: z.date({ error: "Valid from is required" }),
  expiredAt: z.date().optional(),
  notes: z.string().optional(),
};

const expiryNotBeforeStart = (values: { validFrom: Date; expiredAt?: Date }) =>
  !values.expiredAt || values.expiredAt >= values.validFrom;

const expiryIssue = {
  message: "Expiry date cannot be before valid from",
  path: ["expiredAt"],
};

export const createVoucherBatchFormSchema = z
  .object({
    categoryId: z.string().min(1, "Category is required"),
    benefitId: z.string().min(1, "Benefit is required"),
    // The number input emits a string.
    quantity: z
      .string()
      .min(1, "Quantity is required")
      .refine((value) => {
        const quantity = Number(value);
        return (
          Number.isInteger(quantity) &&
          quantity >= 1 &&
          quantity <= MAX_VOUCHERS_PER_BATCH
        );
      }, `Quantity must be a whole number from 1 to ${MAX_VOUCHERS_PER_BATCH}`),
    ...validityShape,
  })
  .refine(expiryNotBeforeStart, expiryIssue);

export type CreateVoucherBatchFormValues = z.infer<
  typeof createVoucherBatchFormSchema
>;

// The date pickers start empty; the schema rejects a missing valid-from.
export const defaultCreateVoucherBatchFormValues = {
  categoryId: "",
  benefitId: "",
  quantity: "",
  validFrom: undefined,
  expiredAt: undefined,
  notes: "",
} as unknown as CreateVoucherBatchFormValues;

export const editVoucherBatchFormSchema = z
  .object({
    ...validityShape,
    isActive: z.boolean().default(true),
  })
  .refine(expiryNotBeforeStart, expiryIssue);

export type EditVoucherBatchFormValues = z.infer<
  typeof editVoucherBatchFormSchema
>;

export const defaultEditVoucherBatchValues = (
  entity: VoucherBatch,
): EditVoucherBatchFormValues => ({
  validFrom: parseISO(entity.validFrom),
  expiredAt: entity.expiredAt ? parseISO(entity.expiredAt) : undefined,
  notes: entity.notes ?? "",
  isActive: entity.isActive,
});
