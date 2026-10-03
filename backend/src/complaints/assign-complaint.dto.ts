import { IsInt, Min } from 'class-validator';

export class AssignComplaintDto {
  @IsInt()
  @Min(1)
  employeeId: number;
}
