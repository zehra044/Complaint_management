import { IsIn } from 'class-validator';

export const COMPLAINT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

export class UpdateComplaintStatusDto {
  @IsIn(COMPLAINT_STATUSES)
  status: (typeof COMPLAINT_STATUSES)[number];
}
