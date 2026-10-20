interface NamedRef {
  id: string;
  name: string;
}

/** A voucher redeemed at this site. */
export interface VoucherRedemption {
  id: string;
  voucherId: string;
  voucherCode: string;
  originTenantId: string;
  redeemingTenantId: string;
  redeemedAt: string;
  redeemedBy: string | null;
  redeemedByName: string | null;
  createdAt: string;
  /** When the sticker was last printed; null if it never was. */
  printedAt: string | null;
  category: NamedRef | null;
  benefit: NamedRef | null;
}

/** Narrows the redemption history; empty values mean "any". */
export interface VoucherRedemptionFilters {
  categoryId?: string;
  benefitId?: string;
  /** Redeemed-at dates, yyyy-MM-dd in the tenant's timezone, inclusive. */
  startDate?: string;
  endDate?: string;
}

/** How many redemptions match the filters, and what was redeemed most. */
export interface VoucherRedemptionSummary {
  totalRedeemed: number;
  topCategory: (NamedRef & { count: number }) | null;
  topBenefit: (NamedRef & { count: number }) | null;
}

export interface VoucherRedemptionResult {
  id: string;
  voucherId: string;
  code: string;
  redeemedAt: string;
}

/** A redemption with the voucher it used, from printing to redeeming. */
export interface VoucherRedemptionDetail {
  id: string;
  voucherCode: string;
  /** When the sticker was last printed; null if it never was. */
  printedAt: string | null;
  printCount: number;
  category: NamedRef | null;
  benefit: NamedRef | null;
  /** Dates are yyyy-MM-dd. */
  validFrom: string;
  expiredAt: string | null;
  batchCode: string;
  redeemedAt: string;
  redeemedByName: string | null;
}
