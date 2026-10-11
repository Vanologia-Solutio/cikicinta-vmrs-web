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
import { UpdateVoucherCategoryDto } from "@/shared/dtos/voucher-category";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditVoucherCategoryValues,
  voucherCategoryFormSchema,
  VoucherCategoryFormValues,
} from "@/shared/schemas/voucher-category";
import { VoucherCategory } from "@/shared/types/voucher-category";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function EditVoucherCategoryDialog({
  entity,
}: {
  entity: VoucherCategory;
}) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<VoucherCategoryFormValues>(
      FormSchemaKeys.EDIT_VOUCHER_CATEGORY,
      {
        enabled: open,
      },
    );

  const { mutateAsync: updateVoucherCategory, isPending: isUpdating } =
    voucherCategoryQueries.useUpdate();

  const isBusy = isUpdating || isFormSchemaLoading;

  const handleSubmit = async (values: VoucherCategoryFormValues) => {
    try {
      const payload: UpdateVoucherCategoryDto = { ...values, id: entity.id };
      const res = await updateVoucherCategory(payload);
      if (res.success) {
        notify.success(res.message ?? "Voucher category updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update voucher category", {
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
          <DialogTitle>Edit Voucher Category {entity.name}</DialogTitle>
          <DialogDescription>
            Update voucher category information and details.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<VoucherCategoryFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_VOUCHER_CATEGORY}
            modal
            schema={voucherCategoryFormSchema}
            defaultValues={defaultEditVoucherCategoryValues(entity)}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
