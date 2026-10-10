import { BaseEntityWithId } from "./general";

export interface Role extends BaseEntityWithId {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
}
