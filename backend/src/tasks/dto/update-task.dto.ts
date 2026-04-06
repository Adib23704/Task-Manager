import { IsEnum, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../../_prisma/client.js";

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  assignedUserId?: string | null;
}
