interface TenantRef {
  id: string;
  name: string;
  code: string | null;
}

/** One event type flowing from one tenant to another. */
export interface SyncRoute {
  id: string;
  sourceTenantId: string;
  destinationTenantId: string;
  eventType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  sourceTenant: TenantRef | null;
  destinationTenant: TenantRef | null;
}
