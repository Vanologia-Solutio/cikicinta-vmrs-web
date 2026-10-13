import { PageHeader } from "@/components/general/page-header";
import { CreateSyncRouteDialog } from "@/components/platform/synchronization/routes/create-sync-route-dialog";
import { SyncRoutesTable } from "@/components/platform/synchronization/routes/sync-routes-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function SyncRoutesPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Sync Routes"
        description="Which tenant sends which kind of event to which other tenant."
        actions={<CreateSyncRouteDialog />}
      />
      <SyncRoutesTable />
    </main>
  );
}
