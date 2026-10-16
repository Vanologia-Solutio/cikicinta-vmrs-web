"use client";

import { PrinterAgentPanel } from "@/components/general/printer-agent/printer-agent-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarcodeIcon } from "@phosphor-icons/react";
import { CalibratePrinterButton } from "./calibrate-printer-button";
import { LabelSettingsCard } from "./label-settings-card";
import { TestPrintControls } from "./test-print-controls";

/** Every test sticker carries this code; it is never a real voucher. */
const SAMPLE_CODE = "00000000000000";

export function PrinterConfiguration() {
  return (
    <div className="space-y-4">
      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <BarcodeIcon />
        <AlertTitle>Test prints use a sample code</AlertTitle>
        <AlertDescription>
          Every test sticker is printed with{" "}
          <span className="font-mono">{SAMPLE_CODE}</span>, filling whole rows.
          It is only for checking alignment and scanning and is not recorded as
          a print job.
        </AlertDescription>
      </Alert>

      {/* No vouchers are printed from this page, only the printer is managed. */}
      <PrinterAgentPanel
        renderPrinterActions={(printerId) => (
          <div className="flex items-center gap-2">
            <TestPrintControls printerId={printerId} />
            <CalibratePrinterButton printerId={printerId} />
          </div>
        )}
      />

      <LabelSettingsCard />
    </div>
  );
}
