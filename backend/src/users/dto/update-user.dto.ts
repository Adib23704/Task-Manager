import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../_prisma/client.js";

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
