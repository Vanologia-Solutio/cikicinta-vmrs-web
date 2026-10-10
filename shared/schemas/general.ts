import * as z from "zod";

export const deleteEntitySchema = (entityName: string) =>
  z.object({
    confirm: z.string().refine((val) => val.trim() === entityName.trim(), {
      message: `Typing "${entityName}" is required`,
    }),
  });

export type DeleteEntityValues = z.infer<ReturnType<typeof deleteEntitySchema>>;
