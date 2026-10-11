import { BaseEntityWithId } from "./general";
import { VoucherCategory } from "./voucher-category";

export interface VoucherBenefit extends BaseEntityWithId {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  category: Pick<VoucherCategory, "id" | "name">;
}
