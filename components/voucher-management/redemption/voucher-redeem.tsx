"use client";

import { VoucherResultCard } from "@/components/general/voucher-result-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { voucherCheckQueries } from "@/hooks/use-voucher-check";
import { voucherRedemptionQueries } from "@/hooks/use-voucher-redemption";
import { errorMessage, notify } from "@/lib/toast";
import { VoucherCheckResult } from "@/shared/types/voucher-check";
import { VoucherRedemptionResult } from "@/shared/types/voucher-redemption";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface RedeemFormValues {
  code: string;
}

/**
 * An eligible voucher is redeemed as soon as it is looked up, so one scan is
 * all the operator does. Submitting the code form is the only trigger, and
 * the card of what was checked stays on screen as the receipt.
 */
export function VoucherRedeem() {
  const [checked, setChecked] = useState<VoucherCheckResult | null>(null);
  const [redeemed, setRedeemed] = useState<VoucherRedemptionResult | null>(
    null,
  );
  const [failure, setFailure] = useState<string | null>(null);

  const { mutateAsync: checkVoucher, isPending: isChecking } =
    voucherCheckQueries.useCheck();
  const { mutateAsync: redeemVoucher, isPending: isRedeeming } =
    voucherRedemptionQueries.useRedeem();

  const form = useForm<RedeemFormValues>({ defaultValues: { code: "" } });
  const isBusy = isChecking || isRedeeming;

  const readyForNextScan = () => {
    form.reset();
    form.setFocus("code");
  };

  const lookUpAndRedeem = async (code: string) => {
    setChecked(null);
    setRedeemed(null);
    setFailure(null);
    try {
      const { data: result } = await checkVoucher(code);
      setChecked(result);
      if (!result.eligible) return;

      try {
        const res = await redeemVoucher(result.code);
        setRedeemed(res.data);
        notify.success(res.message ?? "Voucher redeemed successfully");
      } catch (error) {
        // Kept on screen, not just a toast: the operator has a customer waiting
        // and needs to see why it did not go through.
        setFailure(errorMessage(error));
      }
    } catch (error) {
      notify.error("Could not check the voucher", {
        description: errorMessage(error),
      });
    } finally {
      readyForNextScan();
    }
  };

  const handleSubmit = async ({ code }: RedeemFormValues) => {
    // The field stays enabled so it never loses focus; a submit that arrives
    // mid-request is dropped instead.
    if (isBusy) return;
    const scanned = code.trim();
    if (scanned) return lookUpAndRedeem(scanned);
    form.setError("code", { message: "Scan or enter a voucher code" });
  };

  return (
    <div className="space-y-4 mb-4">
      <Card>
        <CardHeader>
          <CardTitle>Voucher code</CardTitle>
          <CardDescription>
            Scan the sticker&apos;s barcode, or type its code and press Enter.
            An eligible voucher is redeemed right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form autoComplete="off" onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="voucher-redeem-code">Code</FieldLabel>
                  <div className="flex max-w-md gap-2">
                    <Input
                      id="voucher-redeem-code"
                      className="font-mono"
                      placeholder="00000000000000"
                      inputMode="numeric"
                      autoFocus
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <Button type="submit" variant="outline" disabled={isBusy}>
                      <MagnifyingGlassIcon />
                      {isChecking
                        ? "Checking..."
                        : isRedeeming
                          ? "Redeeming..."
                          : "Redeem"}
                    </Button>
                  </div>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </form>
        </CardContent>
      </Card>

      {redeemed && (
        <Alert variant="success">
          <CheckCircleIcon />
          <AlertTitle>Redeemed {redeemed.code}</AlertTitle>
          <AlertDescription>
            Recorded at {format(new Date(redeemed.redeemedAt), "HH:mm:ss")}.
            This voucher cannot be used again.
          </AlertDescription>
        </Alert>
      )}

      {failure && (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>Not redeemed</AlertTitle>
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      )}

      {checked && <VoucherResultCard result={checked} redeemed={!!redeemed} />}
    </div>
  );
}
