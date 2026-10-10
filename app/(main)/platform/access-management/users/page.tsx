import { PageHeader } from "@/components/general/page-header";
import { RegisterUserDialog } from "@/components/platform/access-management/users/register-user-dialog";
import { UsersTable } from "@/components/platform/access-management/users/users-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function UsersPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Users"
        description="Manage user accounts, their tenant and their role."
        actions={<RegisterUserDialog />}
      />
      <UsersTable />
    </main>
  );
}
