export interface CreateVoucherCategoryDto {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateVoucherCategoryDto extends Partial<CreateVoucherCategoryDto> {
  id: string;
}
