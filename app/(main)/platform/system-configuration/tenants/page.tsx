import { PageHeader } from "@/components/general/page-header";
import { CreateTenantDialog } from "@/components/platform/system-configuration/tenants/create-tenant-dialog";
import { TenantsTable } from "@/components/platform/system-configuration/tenants/tenants-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function TenantsPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Tenants"
        description="Manage tenants (head office, branches and outlets)."
        actions={<CreateTenantDialog />}
      />
      <TenantsTable />
    </main>
  );
}
