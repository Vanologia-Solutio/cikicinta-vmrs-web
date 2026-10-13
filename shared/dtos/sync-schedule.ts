export interface CreateSyncScheduleDto {
  code: string;
  platform: string;
  jobType: string;
  cronExpression: string;
  isActive: boolean;
}

export interface UpdateSyncScheduleDto extends Partial<CreateSyncScheduleDto> {
  id: string;
}
