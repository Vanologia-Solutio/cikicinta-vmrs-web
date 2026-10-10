import { BaseEntityWithId } from "./general";

export interface PlatformModule extends BaseEntityWithId {
  code: string;
  name: string;
  description?: string;
  sequence: number;
  isActive: boolean;
}
