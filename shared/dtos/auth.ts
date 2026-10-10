export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName?: string;
  username: string;
  password: string;
  tenantId: string;
  roleId: string;
  isActive?: boolean;
}
