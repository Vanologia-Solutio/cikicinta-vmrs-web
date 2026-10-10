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
import { UpdateRoleDto } from "@/shared/dtos/role";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditRoleValues,
  roleFormSchema,
  RoleFormValues,
} from "@/shared/schemas/role";
import { Role } from "@/shared/types/role";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function EditRoleDialog({ entity }: { entity: Role }) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<RoleFormValues>(FormSchemaKeys.EDIT_ROLE, {
      enabled: open,
    });

  const { mutateAsync: updateRole, isPending: isUpdating } =
    roleQueries.useUpdate();

  const isBusy = isUpdating || isFormSchemaLoading;

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      const payload: UpdateRoleDto = { ...values, id: entity.id };
      const res = await updateRole(payload);
      if (res.success) {
        notify.success(res.message ?? "Role updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update role", {
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
          <DialogTitle>Edit Role {entity.name}</DialogTitle>
          <DialogDescription>
            Update role information and details.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={3} cols={2} />
        ) : (
          <DynamicForm<RoleFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_ROLE}
            modal
            schema={roleFormSchema}
            defaultValues={defaultEditRoleValues(entity)}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
