export interface CreateTenantDto {
  name: string;
  code?: string;
  type: string;
  timezone?: string;
  isActive: boolean;
  initializeDefaultAccessControl?: boolean;
}

export interface UpdateTenantDto extends Partial<
  Omit<CreateTenantDto, "initializeDefaultAccessControl">
> {
  id: string;
}
