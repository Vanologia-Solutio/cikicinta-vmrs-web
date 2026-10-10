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
import { RegisterDto } from "@/shared/dtos/auth";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultRegisterUserValues,
  UserFormValues,
  userSchema,
} from "@/shared/schemas/user";
import { UserPlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

export function RegisterUserDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<UserFormValues>(FormSchemaKeys.REGISTER_USER, {
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

  const { mutateAsync: registerUser, isPending: isRegistering } =
    userQueries.useRegister();

  const isBusy =
    isRegistering || isFormSchemaLoading || isRolesLoading || isTenantsLoading;

  const handleSubmit = async (values: UserFormValues) => {
    try {
      const payload: RegisterDto = {
        ...values,
        lastName: values.lastName || undefined,
      };
      const res = await registerUser(payload);
      if (res.success) {
        notify.success(res.message ?? "User registered successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to register user", {
        description: errorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isRegistering) return;
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button />}>
        <UserPlusIcon />
        Add User
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register New User</DialogTitle>
          <DialogDescription>
            Create an account and assign its tenant and role.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<UserFormValues>
            key={String(open)}
            formId={FormSchemaKeys.REGISTER_USER}
            modal
            schema={userSchema}
            defaultValues={defaultRegisterUserValues}
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
