"use client";

import {
  DynamicForm,
  DynamicFormSkeleton,
} from "@/components/form/dynamic-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formSchemaQueries } from "@/hooks/use-form-schema";
import { masterDataQueries } from "@/hooks/use-master-data";
import { voucherBenefitQueries } from "@/hooks/use-voucher-benefit";
import { errorMessage, notify } from "@/lib/toast";
import { UpdateVoucherBenefitDto } from "@/shared/dtos/voucher-benefit";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditVoucherBenefitValues,
  voucherBenefitFormSchema,
  VoucherBenefitFormValues,
} from "@/shared/schemas/voucher-benefit";
import { VoucherBenefit } from "@/shared/types/voucher-benefit";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

export function EditVoucherBenefitDialog({
  entity,
}: {
  entity: VoucherBenefit;
}) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<VoucherBenefitFormValues>(
      FormSchemaKeys.EDIT_VOUCHER_BENEFIT,
      {
        enabled: open,
      },
    );

  const { mutateAsync: updateVoucherBenefit, isPending: isUpdating } =
    voucherBenefitQueries.useUpdate();

  const { data: categories, isLoading: isCategoriesLoading } =
    masterDataQueries.useActiveVoucherCategories({ enabled: open });

  const availableOptions = useMemo(
    () => ({ voucherCategories: categories?.data ?? [] }),
    [categories],
  );

  const isBusy = isUpdating || isFormSchemaLoading || isCategoriesLoading;

  const handleSubmit = async (values: VoucherBenefitFormValues) => {
    try {
      const payload: UpdateVoucherBenefitDto = { ...values, id: entity.id };
      const res = await updateVoucherBenefit(payload);
      if (res.success) {
        notify.success(res.message ?? "Voucher benefit updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update voucher benefit", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isUpdating) return;
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${entity.name}`}
          />
        }
      >
        <PencilSimpleLineIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Voucher Benefit {entity.name}</DialogTitle>
          <DialogDescription>
            Update voucher benefit information and details.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<VoucherBenefitFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_VOUCHER_BENEFIT}
            modal
            schema={voucherBenefitFormSchema}
            defaultValues={defaultEditVoucherBenefitValues(entity)}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
            options={availableOptions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
