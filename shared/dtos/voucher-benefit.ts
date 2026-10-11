export interface CreateVoucherBenefitDto {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  categoryId: string;
}

export interface UpdateVoucherBenefitDto extends Partial<CreateVoucherBenefitDto> {
  id: string;
}
