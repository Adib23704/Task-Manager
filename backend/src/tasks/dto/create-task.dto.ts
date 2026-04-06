import { IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;
}
