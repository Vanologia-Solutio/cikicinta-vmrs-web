import { PageHeader } from "@/components/general/page-header";
import { SyncMonitorTabs } from "@/components/platform/synchronization/monitor/sync-monitor-tabs";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function SyncMonitorPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Sync Monitor"
        description="How this site is exchanging voucher data with the others, and what needs attention."
      />
      <SyncMonitorTabs />
    </main>
  );
}
