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
import { moduleQueries } from "@/hooks/use-module";
import { errorMessage, notify } from "@/lib/toast";
import { UpdateModuleDto } from "@/shared/dtos/module";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditModuleValues,
  moduleFormSchema,
  ModuleFormValues,
} from "@/shared/schemas/module";
import { PlatformModule } from "@/shared/types/module";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function EditModuleDialog({ entity }: { entity: PlatformModule }) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<ModuleFormValues>(FormSchemaKeys.EDIT_MODULE, {
      enabled: open,
    });

  const { mutateAsync: updateModule, isPending: isUpdating } =
    moduleQueries.useUpdate();

  const isBusy = isUpdating || isFormSchemaLoading;

  const handleSubmit = async (values: ModuleFormValues) => {
    try {
      const payload: UpdateModuleDto = { ...values, id: entity.id };
      const res = await updateModule(payload);
      if (res.success) {
        notify.success(res.message ?? "Module updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update module", {
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
          <DialogTitle>Edit Module {entity.name}</DialogTitle>
          <DialogDescription>
            Update module information and details.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<ModuleFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_MODULE}
            modal
            schema={moduleFormSchema}
            defaultValues={defaultEditModuleValues(entity)}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
