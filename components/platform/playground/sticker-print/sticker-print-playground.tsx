"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarcodeIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { PrinterAgentPanel } from "@/components/general/printer-agent/printer-agent-panel";
import { SAMPLE_VOUCHERS, StickerVoucher } from "./sample-vouchers";

interface StickerPrintPlaygroundProps {
  /** Persisted voucher records. Defaults to the sample fixture. */
  vouchers?: StickerVoucher[];
}

export function StickerPrintPlayground({
  vouchers = SAMPLE_VOUCHERS,
}: StickerPrintPlaygroundProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // One row per unique voucher id, in the order the records were supplied.
  const rows = useMemo(() => {
    const seen = new Set<string>();
    return vouchers.filter((voucher) => {
      if (seen.has(voucher.id)) return false;
      seen.add(voucher.id);
      return true;
    });
  }, [vouchers]);

  // Always derived from table order, so print order never depends on click order.
  const selectedVouchers = useMemo(
    () => rows.filter((voucher) => selectedIds.has(voucher.id)),
    [rows, selectedIds],
  );

  const stickerCount = selectedVouchers.length;
  const allSelected = rows.length > 0 && stickerCount === rows.length;

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <BarcodeIcon />
        <AlertTitle>Sample data</AlertTitle>
        <AlertDescription>
          These rows are a fixed fixture standing in for persisted vouchers.
          Printing does not create voucher codes and does not record any sticker
          as printed.
        </AlertDescription>
      </Alert>

      <PrinterAgentPanel vouchers={selectedVouchers} />

      <Card>
        <CardHeader>
          <CardTitle>Vouchers</CardTitle>
          <CardDescription>
            {stickerCount} of {rows.length} selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    aria-label="Select all vouchers"
                    checked={allSelected}
                    indeterminate={stickerCount > 0 && !allSelected}
                    disabled={rows.length === 0}
                    onCheckedChange={(checked) =>
                      setSelectedIds(
                        new Set(
                          checked ? rows.map((voucher) => voucher.id) : [],
                        ),
                      )
                    }
                  />
                </TableHead>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Voucher code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((voucher, index) => (
                <TableRow
                  key={voucher.id}
                  data-state={
                    selectedIds.has(voucher.id) ? "selected" : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Select voucher ${voucher.code}`}
                      checked={selectedIds.has(voucher.id)}
                      onCheckedChange={(checked) => toggle(voucher.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono">{voucher.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
