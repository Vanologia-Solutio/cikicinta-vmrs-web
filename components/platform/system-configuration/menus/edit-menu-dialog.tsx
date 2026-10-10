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
import { UpdateMenuDto } from "@/shared/dtos/menu";
import { FormSchemaKeys } from "@/shared/enums/form-schema-keys";
import {
  defaultEditMenuValues,
  menuFormSchema,
  MenuFormValues,
} from "@/shared/schemas/menu";
import { Menu } from "@/shared/types/menu";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { masterDataQueries } from "@/hooks/use-master-data";
import { useIconSearchOptions } from "./use-icon-search-options";

export function EditMenuDialog({ entity }: { entity: Menu }) {
  const [open, setOpen] = useState(false);

  const { data: formSchema, isLoading: isFormSchemaLoading } =
    formSchemaQueries.useByKey<MenuFormValues>(FormSchemaKeys.EDIT_MENU, {
      enabled: open,
    });

  const { data: modules, isLoading: isModulesLoading } =
    masterDataQueries.useActiveModules({ enabled: open });
  const { data: menus, isLoading: isMenusLoading } =
    masterDataQueries.useActiveMenus({ enabled: open, excludeId: entity.id });
  const iconSearch = useIconSearchOptions();

  const availableOptions = useMemo(
    () => ({ modules: modules?.data ?? [], menus: menus?.data ?? [] }),
    [modules, menus],
  );

  const { mutateAsync: updateMenu, isPending: isUpdating } =
    menuQueries.useUpdate();

  const isBusy =
    isUpdating || isFormSchemaLoading || isModulesLoading || isMenusLoading;

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      const payload: UpdateMenuDto = {
        ...values,
        id: entity.id,
        parentId: values.parentId || undefined,
        icon: values.icon || undefined,
      };
      const res = await updateMenu(payload);
      if (res.success) {
        notify.success(res.message ?? "Menu updated successfully");
        setOpen(false);
      }
    } catch (error) {
      notify.error("Failed to update menu", {
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
            aria-label={`Edit ${entity.title}`}
          />
        }
      >
        <PencilSimpleLineIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Menu {entity.title}</DialogTitle>
          <DialogDescription>
            Update menu information and details.
          </DialogDescription>
        </DialogHeader>
        {isFormSchemaLoading ? (
          <DynamicFormSkeleton rows={4} cols={2} />
        ) : (
          <DynamicForm<MenuFormValues>
            key={String(open)}
            formId={FormSchemaKeys.EDIT_MENU}
            modal
            schema={menuFormSchema}
            defaultValues={defaultEditMenuValues(entity)}
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
