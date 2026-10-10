import { BaseEntityWithId } from "./general";
import { Role } from "./role";
import { Tenant } from "./tenant";

export interface User extends BaseEntityWithId {
  firstName: string;
  lastName: string;
  username: string;
  tenant: Tenant;
  role: Role;
  isActive: boolean;
}
