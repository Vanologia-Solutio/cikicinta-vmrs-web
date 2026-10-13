import * as z from "zod";

export const syncRouteFormSchema = z
  .object({
    sourceTenantId: z.string().min(1, "Source tenant is required"),
    destinationTenantId: z.string().min(1, "Destination tenant is required"),
    eventType: z.string().min(1, "Event type is required"),
    isActive: z.boolean().default(true),
  })
  .refine((values) => values.sourceTenantId !== values.destinationTenantId, {
    path: ["destinationTenantId"],
    message: "A tenant cannot route events to itself",
  });

export type SyncRouteFormValues = z.infer<typeof syncRouteFormSchema>;

export const defaultSyncRouteFormValues: SyncRouteFormValues = {
  sourceTenantId: "",
  destinationTenantId: "",
  eventType: "",
  isActive: true,
};
