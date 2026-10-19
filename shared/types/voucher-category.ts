import { BaseEntityWithId } from "./general";
import { VoucherUsageCounts } from "./voucher-usage";

export interface VoucherCategory extends BaseEntityWithId {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

/** A categories-list row, with how many of its vouchers were used. */
export interface VoucherCategoryListItem
  extends VoucherCategory, VoucherUsageCounts {}
