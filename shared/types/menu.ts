import { BaseEntityWithId } from "./general";
import { PlatformModule } from "./module";

export interface Menu extends BaseEntityWithId {
  parent?: Pick<Menu, "id" | "title"> | null;
  title: string;
  path: string;
  icon: string;
  isVisible: boolean;
  isActive: boolean;
  isDefault: boolean;
  module: PlatformModule;
}

export type MenuItem = {
  title: string;
  url?: string;
  icon?: string;
  isVisible: boolean;
  items?: MenuItem[];
};

export type MenuGroups = Record<string, MenuItem[]>;
