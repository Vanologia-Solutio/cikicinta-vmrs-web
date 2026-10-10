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
import { CreateModuleDto } from "@/shared/dtos/module";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultModuleFormValues,
  moduleFormSchema,
  ModuleFormValues,
} from "@/shared/schemas/module";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function CreateModuleDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<ModuleFormValues>(FormSchemaKeys.CREATE_MODULE, {
      enabled: open,
    });

  const { mutateAsync: createModule, isPending: isCreating } =
    moduleQueries.useCreate();

  const isBusy = isCreating || isFormSchemaLoading;

  const handleSubmit = async (values: ModuleFormValues) => {
    try {
      const payload: CreateModuleDto = values;
      const res = await createModule(payload);
      if (res.success) {
        notify.success(res.message ?? "Module created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create module", {
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
        Add Module
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Module</DialogTitle>
          <DialogDescription>
            Add a new module to the platform.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<ModuleFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_MODULE}
            modal
            schema={moduleFormSchema}
            defaultValues={defaultModuleFormValues}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
