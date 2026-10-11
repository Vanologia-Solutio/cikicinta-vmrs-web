import * as z from "zod";

export const confirmPrintRunSchema = z
  .object({
    outcome: z.enum(["all", "none", "stopped_at"], {
      error: "Choose what happened to this run",
    }),
    lastPrintedCode: z.string().trim(),
  })
  .refine(
    (values) => values.outcome !== "stopped_at" || !!values.lastPrintedCode,
    {
      message: "Scan or enter the last sticker that printed",
      path: ["lastPrintedCode"],
    },
  );

export type ConfirmPrintRunValues = z.infer<typeof confirmPrintRunSchema>;
