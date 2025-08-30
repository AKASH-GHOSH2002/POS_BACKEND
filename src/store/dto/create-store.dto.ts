import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { DefaultStatus } from 'src/enum';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  storeCode: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsEnum(DefaultStatus)
  @IsOptional()
  status: DefaultStatus;
}

export class PaginationDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number;

  @IsOptional()
  @IsEnum(DefaultStatus)
  status: DefaultStatus;
}
