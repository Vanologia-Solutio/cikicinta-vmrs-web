import { PageHeader } from "@/components/general/page-header";
import { CreateMenuDialog } from "@/components/platform/system-configuration/menus/create-menu-dialog";
import { MenusTable } from "@/components/platform/system-configuration/menus/menus-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function MenusPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Menus"
        description="Manage navigation menus and where they appear."
        actions={<CreateMenuDialog />}
      />
      <MenusTable />
    </main>
  );
}
