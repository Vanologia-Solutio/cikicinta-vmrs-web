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
import { syncRouteQueries } from "@/hooks/use-sync-route";
import { errorMessage, notify } from "@/lib/toast";
import { SYNC_EVENT_TYPE_OPTIONS } from "@/shared/constants/sync-events";
import { CreateSyncRouteDto } from "@/shared/dtos/sync-route";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultSyncRouteFormValues,
  syncRouteFormSchema,
  SyncRouteFormValues,
} from "@/shared/schemas/sync-route";
import { PlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useCanManageSyncRoutes } from "./use-can-manage-sync-routes";

export function CreateSyncRouteDialog() {
  const [open, setOpen] = useState(false);
  const canManage = useCanManageSyncRoutes();

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<SyncRouteFormValues>(
      FormSchemaKeys.CREATE_SYNC_ROUTE,
      { enabled: open },
    );

  const { data: tenants, isLoading: isTenantsLoading } =
    masterDataQueries.useActiveTenants({ enabled: open });

  const availableOptions = useMemo(
    () => ({
      tenants: tenants?.data ?? [],
      syncEventTypes: SYNC_EVENT_TYPE_OPTIONS,
    }),
    [tenants],
  );

  const { mutateAsync: createSyncRoute, isPending: isCreating } =
    syncRouteQueries.useCreate();

  const isBusy = isCreating || isFormSchemaLoading || isTenantsLoading;

  if (!canManage) return null;

  const handleSubmit = async (values: SyncRouteFormValues) => {
    try {
      const payload: CreateSyncRouteDto = values;
      const res = await createSyncRoute(payload);
      if (res.success) {
        notify.success(res.message ?? "Sync route created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create sync route", {
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
        Add Route
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Sync Route</DialogTitle>
          <DialogDescription>
            Send one kind of event from one tenant to another.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<SyncRouteFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_SYNC_ROUTE}
            modal
            schema={syncRouteFormSchema}
            defaultValues={defaultSyncRouteFormValues}
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
