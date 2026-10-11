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
import { CreateVoucherBenefitDto } from "@/shared/dtos/voucher-benefit";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultVoucherBenefitFormValues,
  voucherBenefitFormSchema,
  VoucherBenefitFormValues,
} from "@/shared/schemas/voucher-benefit";
import { PlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

export function CreateVoucherBenefitDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<VoucherBenefitFormValues>(
      FormSchemaKeys.CREATE_VOUCHER_BENEFIT,
      {
        enabled: open,
      },
    );

  const { mutateAsync: createVoucherBenefit, isPending: isCreating } =
    voucherBenefitQueries.useCreate();

  const { data: categories, isLoading: isCategoriesLoading } =
    masterDataQueries.useActiveVoucherCategories({ enabled: open });

  const availableOptions = useMemo(
    () => ({ voucherCategories: categories?.data ?? [] }),
    [categories],
  );

  const isBusy = isCreating || isFormSchemaLoading || isCategoriesLoading;

  const handleSubmit = async (values: VoucherBenefitFormValues) => {
    try {
      const payload: CreateVoucherBenefitDto = values;
      const res = await createVoucherBenefit(payload);
      if (res.success) {
        notify.success(res.message ?? "Voucher benefit created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create voucher benefit", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isCreating) return;
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add Benefit
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Voucher Benefit</DialogTitle>
          <DialogDescription>Add a new voucher benefit.</DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<VoucherBenefitFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_VOUCHER_BENEFIT}
            modal
            schema={voucherBenefitFormSchema}
            defaultValues={defaultVoucherBenefitFormValues}
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
