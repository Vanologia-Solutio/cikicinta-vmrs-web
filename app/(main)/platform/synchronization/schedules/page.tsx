import { PageHeader } from "@/components/general/page-header";
import { CreateSyncScheduleDialog } from "@/components/platform/synchronization/schedules/create-sync-schedule-dialog";
import { SyncSchedulesTable } from "@/components/platform/synchronization/schedules/sync-schedules-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function SyncSchedulesPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Sync Schedules"
        description="Which sync jobs run on their own, and how often."
        actions={<CreateSyncScheduleDialog />}
      />
      <SyncSchedulesTable />
    </main>
  );
}
