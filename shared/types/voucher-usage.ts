/** How many of a group's vouchers have been printed and redeemed. */
export interface VoucherUsageCounts {
  /** Vouchers printed at least once; reprints do not count again. */
  printedCount: number;
  redeemedCount: number;
}
