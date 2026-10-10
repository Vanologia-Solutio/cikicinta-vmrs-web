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
import { roleQueries } from "@/hooks/use-role";
import { errorMessage, notify } from "@/lib/toast";
import { CreateRoleDto } from "@/shared/dtos/role";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultRoleFormValues,
  roleFormSchema,
  RoleFormValues,
} from "@/shared/schemas/role";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function CreateRoleDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<RoleFormValues>(FormSchemaKeys.CREATE_ROLE, {
      enabled: open,
    });

  const { mutateAsync: createRole, isPending: isCreating } =
    roleQueries.useCreate();

  const isBusy = isCreating || isFormSchemaLoading;

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      const payload: CreateRoleDto = values;
      const res = await createRole(payload);
      if (res.success) {
        notify.success(res.message ?? "Role created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create role", {
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
        Add Role
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>Add a new role to the platform.</DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<RoleFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_ROLE}
            modal
            schema={roleFormSchema}
            defaultValues={defaultRoleFormValues}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
