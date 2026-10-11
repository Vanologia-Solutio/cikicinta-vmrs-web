"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { printerAgentQueries } from "@/hooks/use-printer-agent";
import { notify } from "@/lib/toast";
import { PrinterAgentError } from "@/services/printer-agent-service";
import { agentTroubleshooting } from "@/shared/utils/printer-agent";
import { PrinterIcon } from "@phosphor-icons/react";
import { useState } from "react";

const ROW_ITEMS = [
  { value: "1", label: "1 row" },
  { value: "3", label: "3 rows" },
  { value: "10", label: "10 rows" },
];

/**
 * Prints full rows of the all-zero sample code through the agent, for
 * checking alignment and scanning. It is not a voucher print job.
 */
export function TestPrintControls({ printerId }: { printerId?: string }) {
  const [rows, setRows] = useState("1");
  const { mutateAsync: testPrint, isPending } =
    printerAgentQueries.useTestPrint();

  const handlePrint = async () => {
    if (!printerId) return;
    try {
      const result = await testPrint({ printerId, rows: Number(rows) });
      notify.success(`${result.labelCount} test stickers sent`, {
        description: `Each one carries the sample code ${result.code}.`,
      });
    } catch (error) {
      const failure = error instanceof PrinterAgentError ? error : undefined;
      notify.error("Could not send the test print", {
        description:
          agentTroubleshooting(failure?.code) ??
          failure?.message ??
          "Unexpected error.",
      });
    }
  };

  return (
    <>
      <Select
        items={ROW_ITEMS}
        value={rows}
        onValueChange={(next) => {
          if (next) setRows(next);
        }}
      >
        <SelectTrigger aria-label="Test print size" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {ROW_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button disabled={!printerId || isPending} onClick={handlePrint}>
        <PrinterIcon />
        {isPending ? "Sending..." : "Print test"}
      </Button>
    </>
  );
}
