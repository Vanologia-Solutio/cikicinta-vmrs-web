import { CopyText } from "@/components/general/copy-text";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VoucherCheckResult } from "@/shared/types/voucher-check";
import { formatTag } from "@/shared/utils/formatter";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";
import { ReactNode } from "react";

const formatDate = (date: string | null | undefined, fallback: string) =>
  date ? format(parseISO(date), "dd MMM yyyy") : fallback;

function details(result: VoucherCheckResult): [string, ReactNode][] {
  return [
    ["Category", result.category?.name ?? "-"],
    ["Benefit", result.benefit?.name ?? "-"],
    ["Valid from", formatDate(result.batch?.validFrom, "-")],
    ["Expires", formatDate(result.batch?.expiredAt, "No expiry")],
    [
      "Origin tenant",
      result.originTenant
        ? [result.originTenant.name, result.originTenant.code]
            .filter(Boolean)
            .join(" - ")
        : "-",
    ],
    ["Voucher status", result.voucher ? formatTag(result.voucher.status) : "-"],
    [
      "Batch",
      result.batch ? (
        <CopyText
          text={result.batch.batchCode}
          className="justify-end"
          textClassName="font-mono"
        />
      ) : (
        "-"
      ),
    ],
    [
      "Printed at",
      result.voucher?.lastPrintedAt
        ? format(new Date(result.voucher.lastPrintedAt), "dd MMM yyyy HH:mm:ss")
        : "Never printed",
    ],
  ];
}

/**
 * What a voucher lookup found: whether it can be used, why not if it cannot,
 * and its details. `children` go in the footer (e.g. a redeem button).
 */
export function VoucherResultCard({
  result,
  redeemed = false,
  children,
}: {
  result: VoucherCheckResult;
  /** The voucher was redeemed just now, so show that instead of "Eligible". */
  redeemed?: boolean;
  children?: ReactNode;
}) {
  return (
    // Tinted by the verdict, so it reads at a glance from the counter.
    <Card
      className={cn(
        result.eligible
          ? "bg-primary/10 ring-primary"
          : "bg-destructive/10 ring-destructive",
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{result.code}</CardTitle>
          <Badge variant={result.eligible ? "default" : "destructive"}>
            {result.eligible ? <CheckCircleIcon /> : <XCircleIcon />}
            {redeemed
              ? "Redeemed"
              : result.eligible
                ? "Eligible"
                : "Not eligible"}
          </Badge>
        </div>
        {!result.eligible && (
          <CardDescription>
            <ul className="list-disc list-inside text-destructive font-medium">
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </CardDescription>
        )}
      </CardHeader>
      {result.found && (
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {details(result).map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b py-1"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
      {children && <CardFooter>{children}</CardFooter>}
    </Card>
  );
}
