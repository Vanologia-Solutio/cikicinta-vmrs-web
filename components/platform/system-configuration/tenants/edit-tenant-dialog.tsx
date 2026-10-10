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
import { UpdateTenantDto } from "@/shared/dtos/tenant";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditTenantValues,
  tenantFormSchema,
  TenantFormValues,
} from "@/shared/schemas/tenant";
import { Tenant } from "@/shared/types/tenant";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { lovQueries } from "@/hooks/use-lov";
import { masterDataQueries } from "@/hooks/use-master-data";
import { LovKeys } from "@/shared/enums/lov-keys";

export function EditTenantDialog({ entity }: { entity: Tenant }) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<TenantFormValues>(FormSchemaKeys.EDIT_TENANT, {
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

  const { mutateAsync: updateTenant, isPending: isUpdating } =
    tenantQueries.useUpdate();

  const isBusy = isUpdating || isFormSchemaLoading || isTenantTypesLoading;

  const handleSubmit = async (values: TenantFormValues) => {
    try {
      const payload: UpdateTenantDto = {
        id: entity.id,
        name: values.name,
        code: values.code || undefined,
        type: values.type,
        timezone: values.timezone,
        isActive: values.isActive,
      };
      const res = await updateTenant(payload);
      if (res.success) {
        notify.success(res.message ?? "Tenant updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update tenant", {
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
          <DialogTitle>Edit Tenant {entity.name}</DialogTitle>
          <DialogDescription>
            Update tenant information and details.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<TenantFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_TENANT}
            modal
            schema={tenantFormSchema}
            defaultValues={defaultEditTenantValues(entity)}
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
