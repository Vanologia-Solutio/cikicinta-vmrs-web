interface NamedRef {
  id: string;
  name: string;
}

/** Result of looking a voucher up by its barcode. Nothing is redeemed. */
export interface VoucherCheckResult {
  code: string;
  found: boolean;
  eligible: boolean;
  /** Why the voucher is not eligible; empty when it is. */
  reasons: string[];
  voucher: { status: string; isActive: boolean; printCount: number } | null;
  batch: {
    id: string;
    batchCode: string;
    /** Dates are yyyy-MM-dd. */
    validFrom: string;
    expiredAt: string | null;
    isActive: boolean;
  } | null;
  category: NamedRef | null;
  benefit: NamedRef | null;
  originTenant: (NamedRef & { code: string | null }) | null;
}
