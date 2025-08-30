import { PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsDate,
  IsNumber,
  Min,
  IsNotEmpty,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStaffDetailDto {

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  wpNo: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;
}

export class PaginationDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number;

  @IsOptional()
  keyword: string;
}
