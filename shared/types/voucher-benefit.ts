import { BaseEntityWithId } from "./general";
import { VoucherCategory } from "./voucher-category";
import { VoucherUsageCounts } from "./voucher-usage";

export interface VoucherBenefit extends BaseEntityWithId {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  category: Pick<VoucherCategory, "id" | "name">;
}

/** A benefits-list row, with how many of its vouchers were used. */
export interface VoucherBenefitListItem
  extends VoucherBenefit, VoucherUsageCounts {}
