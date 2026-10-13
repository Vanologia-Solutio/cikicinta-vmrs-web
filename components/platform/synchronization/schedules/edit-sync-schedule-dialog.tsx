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
import { UpdateSyncScheduleDto } from "@/shared/dtos/sync-schedule";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditSyncScheduleValues,
  syncScheduleFormSchema,
  SyncScheduleFormValues,
} from "@/shared/schemas/sync-schedule";
import { SyncSchedule } from "@/shared/types/sync-schedule";
import { withDisabledFields } from "@/shared/utils/form-fields";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useCanManageSyncSchedules } from "./use-can-manage-sync-schedules";

const FORM_OPTIONS = { syncJobTypes: SYNC_JOB_TYPE_OPTIONS };

export function EditSyncScheduleDialog({ entity }: { entity: SyncSchedule }) {
  const [open, setOpen] = useState(false);
  const canManage = useCanManageSyncSchedules();

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<SyncScheduleFormValues>(
      FormSchemaKeys.SYNC_SCHEDULE_FORM,
      { enabled: open },
    );

  // The code names the scheduler and cannot change once it exists.
  const fields = useMemo(
    () => withDisabledFields(formSchema?.data?.fields ?? [], ["code"], true),
    [formSchema],
  );

  const { mutateAsync: updateSyncSchedule, isPending: isUpdating } =
    syncScheduleQueries.useUpdate();

  const isBusy = isUpdating || isFormSchemaLoading;

  if (!canManage) return null;

  const handleSubmit = async (values: SyncScheduleFormValues) => {
    try {
      const payload: UpdateSyncScheduleDto = { ...values, id: entity.id };
      const res = await updateSyncSchedule(payload);
      if (res.success) {
        notify.success(res.message ?? "Sync schedule updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update sync schedule", {
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
            aria-label={`Edit ${entity.code}`}
          />
        }
      >
        <PencilSimpleLineIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Sync Schedule {entity.code}</DialogTitle>
          <DialogDescription>
            Change what the schedule runs and how often.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<SyncScheduleFormValues>
            key={String(open)}
            formId={`edit-${FormSchemaKeys.SYNC_SCHEDULE_FORM}-${entity.id}`}
            modal
            schema={syncScheduleFormSchema}
            defaultValues={defaultEditSyncScheduleValues(entity)}
            fields={fields}
            onSubmit={handleSubmit}
            loading={isBusy}
            options={FORM_OPTIONS}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
