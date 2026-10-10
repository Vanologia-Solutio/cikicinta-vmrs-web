import { PageHeader } from "@/components/general/page-header";
import { ResponsibilitiesManager } from "@/components/platform/access-management/responsibilities/responsibilities-manager";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function ResponsibilitiesPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Responsibilities"
        description="Assign system menus to roles per tenant."
      />
      <ResponsibilitiesManager />
    </main>
  );
}
