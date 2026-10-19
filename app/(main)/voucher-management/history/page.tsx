import { PageHeader } from "@/components/general/page-header";
import { RedemptionHistoryTable } from "@/components/voucher-management/history/redemption-history-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function RedemptionHistoryPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Redemption History"
        description="Every voucher redeemed, newest first. Click a voucher code to see its details."
      />
      <RedemptionHistoryTable />
    </main>
  );
}
