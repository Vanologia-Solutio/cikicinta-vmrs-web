import { PageHeader } from "@/components/general/page-header";
import { RedemptionHistoryTable } from "@/components/voucher-management/redemption/redemption-history-table";
import { VoucherRedeem } from "@/components/voucher-management/redemption/voucher-redeem";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function VoucherRedemptionPage() {
  return (
    <main className={`${PAGE_ANIMATE_IN} flex flex-col gap-6`}>
      <div>
        <PageHeader
          title="Voucher Redemption"
          description="Scan a voucher, check it, and confirm to redeem. A redeemed voucher cannot be used again."
        />
        <VoucherRedeem />
      </div>
      <RedemptionHistoryTable />
    </main>
  );
}
