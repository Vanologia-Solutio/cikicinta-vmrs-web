import { BaseEntityWithId } from "./general";

export interface Tenant extends BaseEntityWithId {
  name: string;
  code?: string;
  type: string;
  timezone: string;
  isPrimary: boolean;
  isActive: boolean;
  initializeDefaultAccessControl: boolean;
}
