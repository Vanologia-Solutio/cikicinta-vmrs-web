import { PageHeader } from "@/components/general/page-header";
import { CreateModuleDialog } from "@/components/platform/system-configuration/modules/create-module-dialog";
import { ModulesTable } from "@/components/platform/system-configuration/modules/modules-table";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function ModulesPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Modules"
        description="Manage the modules that group menus in the sidebar."
        actions={<CreateModuleDialog />}
      />
      <ModulesTable />
    </main>
  );
}
