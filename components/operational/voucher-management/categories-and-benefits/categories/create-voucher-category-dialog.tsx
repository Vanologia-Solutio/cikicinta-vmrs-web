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
import { voucherCategoryQueries } from "@/hooks/use-voucher-category";
import { errorMessage, notify } from "@/lib/toast";
import { CreateVoucherCategoryDto } from "@/shared/dtos/voucher-category";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultVoucherCategoryFormValues,
  voucherCategoryFormSchema,
  VoucherCategoryFormValues,
} from "@/shared/schemas/voucher-category";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function CreateVoucherCategoryDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<VoucherCategoryFormValues>(
      FormSchemaKeys.CREATE_VOUCHER_CATEGORY,
      {
        enabled: open,
      },
    );

  const { mutateAsync: createVoucherCategory, isPending: isCreating } =
    voucherCategoryQueries.useCreate();

  const isBusy = isCreating || isFormSchemaLoading;

  const handleSubmit = async (values: VoucherCategoryFormValues) => {
    try {
      const payload: CreateVoucherCategoryDto = values;
      const res = await createVoucherCategory(payload);
      if (res.success) {
        notify.success(res.message ?? "Voucher category created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create voucher category", {
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
        Add Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Voucher Category</DialogTitle>
          <DialogDescription>Add a new voucher category.</DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<VoucherCategoryFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_VOUCHER_CATEGORY}
            modal
            schema={voucherCategoryFormSchema}
            defaultValues={defaultVoucherCategoryFormValues}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
