export interface CreateMenuDto {
  parentId?: string;
  title: string;
  path: string;
  icon?: string;
  isVisible: boolean;
  isActive: boolean;
  isDefault: boolean;
  moduleId: string;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {
  id: string;
}
