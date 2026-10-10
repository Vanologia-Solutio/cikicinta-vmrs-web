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
import { tenantQueries } from "@/hooks/use-tenant";
import { errorMessage, notify } from "@/lib/toast";
import { CreateTenantDto } from "@/shared/dtos/tenant";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultTenantFormValues,
  tenantFormSchema,
  TenantFormValues,
} from "@/shared/schemas/tenant";
import { BuildingsIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { lovQueries } from "@/hooks/use-lov";
import { masterDataQueries } from "@/hooks/use-master-data";
import { LovKeys } from "@/shared/enums/lov-keys";

export function CreateTenantDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<TenantFormValues>(FormSchemaKeys.CREATE_TENANT, {
      enabled: open,
    });

  const { data: tenantTypes, isLoading: isTenantTypesLoading } =
    lovQueries.useList(LovKeys.TENANT_TYPE, { enabled: open });

  const [timezoneKeyword, setTimezoneKeyword] = useState("");
  const { data: timezones, isFetching: isTimezonesLoading } =
    masterDataQueries.useActiveTimezones(timezoneKeyword, { enabled: open });

  const availableOptions = useMemo(
    () => ({ tenantTypes: tenantTypes?.data ?? [] }),
    [tenantTypes],
  );
  const searchOptions = useMemo(
    () => ({
      timezones: {
        rawOptions: timezones?.data ?? [],
        isLoading: isTimezonesLoading,
        onKeywordChange: setTimezoneKeyword,
      },
    }),
    [timezones, isTimezonesLoading],
  );

  const { mutateAsync: createTenant, isPending: isCreating } =
    tenantQueries.useCreate();

  const isBusy = isCreating || isFormSchemaLoading || isTenantTypesLoading;

  const handleSubmit = async (values: TenantFormValues) => {
    try {
      const payload: CreateTenantDto = {
        ...values,
        code: values.code || undefined,
      };
      const res = await createTenant(payload);
      if (res.success) {
        notify.success(res.message ?? "Tenant created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create tenant", {
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
        <BuildingsIcon />
        Add Tenant
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription>
            Add a new tenant to the platform.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<TenantFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_TENANT}
            modal
            schema={tenantFormSchema}
            defaultValues={defaultTenantFormValues}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
            options={availableOptions}
            searchOptions={searchOptions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
