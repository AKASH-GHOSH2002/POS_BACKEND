import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLoginDetailDto {
  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsString()
  ipAddress: string;

  @IsOptional()
  @IsString()
  userAgent: string;
}
