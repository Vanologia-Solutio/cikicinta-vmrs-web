export interface CreateModuleDto {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sequence: number;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> {
  id: string;
}
