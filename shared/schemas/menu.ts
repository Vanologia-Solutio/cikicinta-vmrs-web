import * as z from "zod";
import { Menu } from "../types/menu";

export const menuFormSchema = z.object({
  parentId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  path: z
    .string()
    .min(1, "Path is required")
    .transform((v) => v.toLowerCase()),
  icon: z.string().optional(),
  isVisible: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  moduleId: z.string().min(1, "Module is required"),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;

export const defaultMenuFormValues: MenuFormValues = {
  parentId: "",
  title: "",
  path: "",
  icon: "",
  isVisible: true,
  isActive: true,
  isDefault: false,
  moduleId: "",
};

export function defaultEditMenuValues(entity: Menu): MenuFormValues {
  return {
    parentId: entity.parent?.id || "",
    title: entity.title,
    path: entity.path,
    icon: entity.icon,
    isVisible: entity.isVisible,
    isActive: entity.isActive,
    isDefault: entity.isDefault,
    moduleId: entity.module.id,
  };
}
