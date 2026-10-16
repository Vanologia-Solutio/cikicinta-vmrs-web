"use client";

import {
  DynamicForm,
  DynamicFormSkeleton,
} from "@/components/form/dynamic-form";
import { WatchField } from "@/components/form/watch-field";
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
import { voucherBatchQueries } from "@/hooks/use-voucher-batch";
import { errorMessage, notify } from "@/lib/toast";
import { CreateVoucherBatchDto } from "@/shared/dtos/voucher-batch";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  createVoucherBatchFormSchema,
  CreateVoucherBatchFormValues,
  defaultCreateVoucherBatchFormValues,
  toApiDate,
} from "@/shared/schemas/voucher-batch";
import { PlusIcon } from "@phosphor-icons/react";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

export function CreateVoucherBatchDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] =
    useState<UseFormReturn<CreateVoucherBatchFormValues> | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const lastCategoryId = useRef("");

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<CreateVoucherBatchFormValues>(
      FormSchemaKeys.CREATE_VOUCHER_BATCH,
      { enabled: open },
    );

  const { data: categories, isLoading: isCategoriesLoading } =
    masterDataQueries.useActiveVoucherCategories({ enabled: open });
  // Benefits belong to a category, so they are only loaded once one is chosen.
  const { data: benefits, isFetching: isBenefitsLoading } =
    masterDataQueries.useActiveVoucherBenefits({
      enabled: open && !!categoryId,
      categoryId,
    });

  const availableOptions = useMemo(
    () => ({
      voucherCategories: categories?.data ?? [],
      voucherBenefits: categoryId ? (benefits?.data ?? []) : [],
    }),
    [categories, benefits, categoryId],
  );

  // A benefit picked under the previous category is no longer valid.
  const handleCategoryChange = useCallback(
    (value: unknown) => {
      const next = typeof value === "string" ? value : "";
      if (next === lastCategoryId.current) return;
      lastCategoryId.current = next;
      setCategoryId(next);
      form?.setValue("benefitId", "");
    },
    [form],
  );

  const { mutateAsync: createBatch, isPending: isCreating } =
    voucherBatchQueries.useCreate();

  const isBusy =
    isCreating ||
    isFormSchemaLoading ||
    isCategoriesLoading ||
    isBenefitsLoading;

  const handleSubmit = async (values: CreateVoucherBatchFormValues) => {
    try {
      const payload: CreateVoucherBatchDto = {
        categoryId: values.categoryId,
        benefitId: values.benefitId,
        quantity: Number(values.quantity),
        validFrom: toApiDate(values.validFrom),
        expiredAt: values.expiredAt ? toApiDate(values.expiredAt) : undefined,
        notes: values.notes || undefined,
      };
      const res = await createBatch(payload);
      if (res.success) {
        notify.success(res.message ?? "Voucher batch created");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create voucher batch", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isCreating) return;
        // The form remounts on every open, so the category tracking restarts.
        lastCategoryId.current = "";
        setCategoryId("");
        setForm(null);
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add Batch
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Voucher Batch</DialogTitle>
          <DialogDescription>
            The vouchers are generated in the background once the batch is
            created.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <Fragment>
            <DynamicForm<CreateVoucherBatchFormValues>
              key={String(open)}
              formId={FormSchemaKeys.CREATE_VOUCHER_BATCH}
              modal
              schema={createVoucherBatchFormSchema}
              defaultValues={defaultCreateVoucherBatchFormValues}
              fields={formSchema?.data?.fields ?? []}
              onSubmit={handleSubmit}
              loading={isBusy}
              options={availableOptions}
              onFormReady={setForm}
            />
            {form && (
              <WatchField
                control={form.control}
                name="categoryId"
                onChange={handleCategoryChange}
              />
            )}
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}
