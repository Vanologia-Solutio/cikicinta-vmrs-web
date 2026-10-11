"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { voucherCheckQueries } from "@/hooks/use-voucher-check";
import { errorMessage, notify } from "@/lib/toast";
import {
  voucherCheckSchema,
  VoucherCheckValues,
} from "@/shared/schemas/voucher-check";
import { VoucherCheckResult } from "@/shared/types/voucher-check";
import { formatTag } from "@/shared/utils/formatter";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircleIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const formatDate = (date: string | null | undefined, fallback: string) =>
  date ? format(parseISO(date), "dd MMM yyyy") : fallback;

function details(result: VoucherCheckResult): [string, string][] {
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
    ["Batch", result.batch?.batchCode ?? "-"],
  ];
}

export function VoucherCheck() {
  const [result, setResult] = useState<VoucherCheckResult | null>(null);
  const { mutateAsync: checkVoucher, isPending } =
    voucherCheckQueries.useCheck();

  const form = useForm<VoucherCheckValues>({
    resolver: zodResolver(voucherCheckSchema),
    defaultValues: { code: "" },
  });

  const handleSubmit = async ({ code }: VoucherCheckValues) => {
    try {
      const res = await checkVoucher(code);
      setResult(res.data);
    } catch (error) {
      notify.error("Could not check the voucher", {
        description: errorMessage(error),
      });
    } finally {
      // Ready for the next scan either way.
      form.reset();
      form.setFocus("code");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <InfoIcon />
        <AlertTitle>Check only</AlertTitle>
        <AlertDescription>
          This page looks a voucher up and shows whether it could be used. It
          never redeems or changes it.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Voucher code</CardTitle>
          <CardDescription>
            Scan the sticker’s barcode, or type its code and press Enter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form autoComplete="off" onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="voucher-check-code">Code</FieldLabel>
                  <div className="flex max-w-md gap-2">
                    {/* A scanner types the code and presses Enter. */}
                    <Input
                      id="voucher-check-code"
                      className="font-mono"
                      placeholder="000000000000"
                      inputMode="numeric"
                      autoFocus
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <Button type="submit" disabled={isPending}>
                      <MagnifyingGlassIcon />
                      {isPending ? "Checking..." : "Check"}
                    </Button>
                  </div>
                  <FieldDescription>
                    The field clears after each check, ready for the next scan.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{result.code}</CardTitle>
              <Badge variant={result.eligible ? "default" : "destructive"}>
                {result.eligible ? <CheckCircleIcon /> : <XCircleIcon />}
                {result.eligible ? "Eligible" : "Not eligible"}
              </Badge>
            </div>
            {!result.eligible && (
              <CardDescription>
                <ul className="list-disc list-inside">
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
        </Card>
      )}
    </div>
  );
}
