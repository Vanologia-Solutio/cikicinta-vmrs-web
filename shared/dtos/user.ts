export interface UpdateUserDto {
  id: string;
  firstName: string;
  lastName?: string;
  username: string;
  tenantId?: string;
  roleId: string;
  isActive: boolean;
}
