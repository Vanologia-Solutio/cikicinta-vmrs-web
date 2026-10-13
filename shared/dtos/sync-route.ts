export interface CreateSyncRouteDto {
  sourceTenantId: string;
  destinationTenantId: string;
  eventType: string;
  isActive?: boolean;
}

/** Only the switch can change; the rest identifies the route. */
export interface UpdateSyncRouteDto {
  id: string;
  isActive: boolean;
}
