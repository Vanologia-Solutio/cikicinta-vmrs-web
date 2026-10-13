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
import { syncScheduleQueries } from "@/hooks/use-sync-schedule";
import { errorMessage, notify } from "@/lib/toast";
import { SYNC_JOB_TYPE_OPTIONS } from "@/shared/constants/sync-schedules";
import { CreateSyncScheduleDto } from "@/shared/dtos/sync-schedule";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultSyncScheduleFormValues,
  syncScheduleFormSchema,
  SyncScheduleFormValues,
} from "@/shared/schemas/sync-schedule";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useCanManageSyncSchedules } from "./use-can-manage-sync-schedules";

const FORM_OPTIONS = { syncJobTypes: SYNC_JOB_TYPE_OPTIONS };

export function CreateSyncScheduleDialog() {
  const [open, setOpen] = useState(false);
  const canManage = useCanManageSyncSchedules();

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<SyncScheduleFormValues>(
      FormSchemaKeys.SYNC_SCHEDULE_FORM,
      { enabled: open },
    );

  const { mutateAsync: createSyncSchedule, isPending: isCreating } =
    syncScheduleQueries.useCreate();

  const isBusy = isCreating || isFormSchemaLoading;

  if (!canManage) return null;

  const handleSubmit = async (values: SyncScheduleFormValues) => {
    try {
      const payload: CreateSyncScheduleDto = values;
      const res = await createSyncSchedule(payload);
      if (res.success) {
        notify.success(res.message ?? "Sync schedule created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create sync schedule", {
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
        Add Schedule
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Sync Schedule</DialogTitle>
          <DialogDescription>
            Run one sync job on a cron schedule.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<SyncScheduleFormValues>
            key={String(open)}
            formId={`create-${FormSchemaKeys.SYNC_SCHEDULE_FORM}`}
            modal
            schema={syncScheduleFormSchema}
            defaultValues={defaultSyncScheduleFormValues}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
            options={FORM_OPTIONS}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
