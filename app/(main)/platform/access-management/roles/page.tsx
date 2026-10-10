import { PageHeader } from "@/components/general/page-header";
import { CreateRoleDialog } from "@/components/platform/access-management/roles/create-role-dialog";
import { RolesTable } from "@/components/platform/access-management/roles/roles-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function RolesPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Roles"
        description="Manage system roles and their access levels."
        actions={<CreateRoleDialog />}
      />
      <RolesTable />
    </main>
  );
}
