import * as z from "zod";

export const voucherCheckSchema = z.object({
  code: z.string().trim().min(1, "Scan or enter a voucher code"),
});

export type VoucherCheckValues = z.infer<typeof voucherCheckSchema>;
