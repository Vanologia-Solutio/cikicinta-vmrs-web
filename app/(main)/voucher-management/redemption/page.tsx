import { PageHeader } from "@/components/general/page-header";
import { RedemptionHistoryTable } from "@/components/voucher-management/history/redemption-history-table";
import { VoucherRedeem } from "@/components/voucher-management/redemption/voucher-redeem";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function VoucherRedemptionPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <div>
        <PageHeader
          title="Voucher Redemption"
          description="Scan a voucher, check it, and confirm to redeem. A redeemed voucher cannot be used again."
        />
        <VoucherRedeem />
      </div>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Redemption history</h2>
        <RedemptionHistoryTable showSummary={false} />
      </section>
    </main>
  );
}
