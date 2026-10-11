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
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { errorMessage, notify } from "@/lib/toast";
import { UpdateVoucherBatchDto } from "@/shared/dtos/voucher-batch";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditVoucherBatchValues,
  editVoucherBatchFormSchema,
  EditVoucherBatchFormValues,
  toApiDate,
} from "@/shared/schemas/voucher-batch";
import { VoucherBatch } from "@/shared/types/voucher-batch";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function EditVoucherBatchDialog({ entity }: { entity: VoucherBatch }) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<EditVoucherBatchFormValues>(
      FormSchemaKeys.EDIT_VOUCHER_BATCH,
      { enabled: open },
    );

  const { mutateAsync: updateBatch, isPending: isUpdating } =
    voucherBatchQueries.useUpdate();

  const isBusy = isUpdating || isFormSchemaLoading;

  const handleSubmit = async (values: EditVoucherBatchFormValues) => {
    try {
      const payload: UpdateVoucherBatchDto = {
        id: entity.id,
        validFrom: toApiDate(values.validFrom),
        expiredAt: values.expiredAt ? toApiDate(values.expiredAt) : undefined,
        notes: values.notes || undefined,
        isActive: values.isActive,
      };
      const res = await updateBatch(payload);
      if (res.success) {
        notify.success(res.message ?? "Voucher batch updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update voucher batch", {
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
            aria-label={`Edit ${entity.batchCode}`}
          />
        }
      >
        <PencilSimpleLineIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Batch {entity.batchCode}</DialogTitle>
          <DialogDescription>
            Category, benefit and quantity cannot change once vouchers exist.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<EditVoucherBatchFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_VOUCHER_BATCH}
            modal
            schema={editVoucherBatchFormSchema}
            defaultValues={defaultEditVoucherBatchValues(entity)}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
