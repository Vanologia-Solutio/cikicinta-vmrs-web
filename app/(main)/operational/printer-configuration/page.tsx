import { PageHeader } from "@/components/general/page-header";
import { PrinterConfiguration } from "@/components/operational/printer-configuration/printer-configuration";
import { PAGE_ANIMATE_IN } from "@/shared/constants/common";

export default function PrinterConfigurationPage() {
  return (
    <main className={PAGE_ANIMATE_IN}>
      <PageHeader
        title="Printer Configuration"
        description="Calibrate the label printer and send a test print through the printer agent."
      />
      <PrinterConfiguration />
    </main>
  );
}
