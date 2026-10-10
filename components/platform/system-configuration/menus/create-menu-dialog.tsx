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
import { menuQueries } from "@/hooks/use-menu";
import { errorMessage, notify } from "@/lib/toast";
import { CreateMenuDto } from "@/shared/dtos/menu";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultMenuFormValues,
  menuFormSchema,
  MenuFormValues,
} from "@/shared/schemas/menu";
import { PlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { masterDataQueries } from "@/hooks/use-master-data";
import { useIconSearchOptions } from "./use-icon-search-options";

export function CreateMenuDialog() {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<MenuFormValues>(FormSchemaKeys.CREATE_MENU, {
      enabled: open,
    });

  const { data: modules, isLoading: isModulesLoading } =
    masterDataQueries.useActiveModules({ enabled: open });
  const { data: menus, isLoading: isMenusLoading } =
    masterDataQueries.useActiveMenus({ enabled: open });
  const iconSearch = useIconSearchOptions();

  const availableOptions = useMemo(
    () => ({ modules: modules?.data ?? [], menus: menus?.data ?? [] }),
    [modules, menus],
  );

  const { mutateAsync: createMenu, isPending: isCreating } =
    menuQueries.useCreate();

  const isBusy =
    isCreating || isFormSchemaLoading || isModulesLoading || isMenusLoading;

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      const payload: CreateMenuDto = {
        ...values,
        parentId: values.parentId || undefined,
        icon: values.icon || undefined,
      };
      const res = await createMenu(payload);
      if (res.success) {
        notify.success(res.message ?? "Menu created successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to create menu", {
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
        Add Menu
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Menu</DialogTitle>
          <DialogDescription>Add a new menu to the platform.</DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<MenuFormValues>
            key={String(open)}
            formId={FormSchemaKeys.CREATE_MENU}
            modal
            schema={menuFormSchema}
            defaultValues={defaultMenuFormValues}
            fields={formSchema?.data?.fields ?? []}
            onSubmit={handleSubmit}
            loading={isBusy}
            options={availableOptions}
            searchOptions={{ icons: iconSearch }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
