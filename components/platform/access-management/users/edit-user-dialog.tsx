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
import { userQueries } from "@/hooks/use-user";
import { errorMessage, notify } from "@/lib/toast";
import { UpdateUserDto } from "@/shared/dtos/user";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultUpdateUserValues,
  EditUserFormValues,
  editUserSchema,
} from "@/shared/schemas/user";
import { User } from "@/shared/types/user";
import { fullName } from "@/shared/utils/user-formatter";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

export function EditUserDialog({ entity }: { entity: User }) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<EditUserFormValues>(FormSchemaKeys.EDIT_USER, {
      enabled: open,
    });

  const { data: roles, isLoading: isRolesLoading } =
    masterDataQueries.useActiveRoles({ enabled: open });
  const { data: tenants, isLoading: isTenantsLoading } =
    masterDataQueries.useActiveTenants({ enabled: open });

  const availableOptions = useMemo(
    () => ({ roles: roles?.data ?? [], tenants: tenants?.data ?? [] }),
    [roles, tenants],
  );

  const { mutateAsync: updateUser, isPending: isUpdating } =
    userQueries.useUpdate();

  const isBusy =
    isUpdating || isFormSchemaLoading || isRolesLoading || isTenantsLoading;

  const handleSubmit = async (values: EditUserFormValues) => {
    try {
      const payload: UpdateUserDto = {
        id: entity.id,
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        username: values.username,
        tenantId: values.tenantId,
        roleId: values.roleId,
        isActive: values.isActive ?? true,
      };
      const res = await updateUser(payload);
      if (res.success) {
        notify.success(res.message ?? "User updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update user", {
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
            aria-label={`Edit ${entity.username}`}
          />
        }
      >
        <PencilSimpleLineIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User {fullName(entity)}</DialogTitle>
          <DialogDescription>
            Update user information, tenant and role.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<EditUserFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_USER}
            modal
            schema={editUserSchema}
            defaultValues={defaultUpdateUserValues(entity)}
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
