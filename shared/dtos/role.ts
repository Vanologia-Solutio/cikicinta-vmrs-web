export interface CreateRoleDto {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  id: string;
}
