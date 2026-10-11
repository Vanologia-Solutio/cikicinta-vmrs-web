import * as z from "zod";

export const pairingTokenSchema = z.object({
  token: z.string().trim().min(1, "Pairing token is required"),
});

export type PairingTokenValues = z.infer<typeof pairingTokenSchema>;
