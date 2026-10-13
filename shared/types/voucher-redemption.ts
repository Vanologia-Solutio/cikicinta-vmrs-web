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
}

export interface VoucherRedemptionResult {
  id: string;
  voucherId: string;
  code: string;
  redeemedAt: string;
}
