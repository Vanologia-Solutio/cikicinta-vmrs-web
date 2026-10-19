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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { voucherCheckQueries } from "@/hooks/use-voucher-check";
import { voucherRedemptionQueries } from "@/hooks/use-voucher-redemption";
import { errorMessage, notify } from "@/lib/toast";
import { VoucherCheckResult } from "@/shared/types/voucher-check";
import { VoucherRedemptionResult } from "@/shared/types/voucher-redemption";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  SealCheckIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface RedeemFormValues {
  code: string;
}

/**
 * Redeeming is two steps on purpose, because it cannot be undone: a scan only
 * looks the voucher up, and the operator then confirms with the Redeem
 * button. Submitting the code form only ever looks a voucher up, so neither
 * a scanner's Enter nor the Look up button can redeem by accident.
 */
export function VoucherRedeem() {
  const [pending, setPending] = useState<VoucherCheckResult | null>(null);
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
  const canConfirm = !!pending?.eligible && !isBusy;

  const readyForNextScan = () => {
    form.reset();
    form.setFocus("code");
  };

  const lookUp = async (code: string) => {
    setRedeemed(null);
    setFailure(null);
    try {
      const res = await checkVoucher(code);
      setPending(res.data);
    } catch (error) {
      setPending(null);
      notify.error("Could not check the voucher", {
        description: errorMessage(error),
      });
    } finally {
      readyForNextScan();
    }
  };

  const confirm = async () => {
    if (!pending?.eligible) return;
    setFailure(null);
    try {
      const res = await redeemVoucher(pending.code);
      setRedeemed(res.data);
      setPending(null);
      notify.success(res.message ?? "Voucher redeemed successfully");
    } catch (error) {
      // Kept on screen, not just a toast: the operator has a customer waiting
      // and needs to see why it did not go through.
      setFailure(errorMessage(error));
      setPending(null);
    } finally {
      readyForNextScan();
    }
  };

  const handleSubmit = async ({ code }: RedeemFormValues) => {
    // The field stays enabled so it never loses focus; a submit that arrives
    // mid-request is dropped instead.
    if (isBusy) return;
    const scanned = code.trim();
    if (scanned) return lookUp(scanned);
    form.setError("code", { message: "Scan or enter a voucher code" });
  };

  const cancel = () => {
    setPending(null);
    readyForNextScan();
  };

  return (
    <div className="space-y-4 mb-4">
      <Card>
        <CardHeader>
          <CardTitle>Voucher code</CardTitle>
          <CardDescription>
            Scan the sticker&apos;s barcode, or type its code and press Enter.
            Check the details, then confirm to redeem.
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
                      {isChecking ? "Checking..." : "Look up"}
                    </Button>
                  </div>
                  <FieldDescription>
                    {pending?.eligible
                      ? "Press Redeem voucher to confirm, or scan another to replace it."
                      : "Nothing is redeemed until you confirm."}
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

      {pending && (
        <VoucherResultCard result={pending}>
          {pending.eligible && (
            <div className="flex w-full flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" disabled={isBusy} onClick={cancel}>
                <XIcon />
                Cancel
              </Button>
              <Button size="lg" disabled={!canConfirm} onClick={confirm}>
                <SealCheckIcon />
                {isRedeeming ? "Redeeming..." : "Redeem voucher"}
              </Button>
            </div>
          )}
        </VoucherResultCard>
      )}
    </div>
  );
}
