import { BaseEntityWithId } from "./general";

export interface VoucherCategory extends BaseEntityWithId {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}
