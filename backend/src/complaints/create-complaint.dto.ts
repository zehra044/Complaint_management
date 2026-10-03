import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateComplaintDto {
  @IsInt()
  @Min(1)
  typeId: number;

  @IsString()
  @IsNotEmpty()
  complaintDetail: string;
}
