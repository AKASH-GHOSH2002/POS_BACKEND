import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DefaultStatus } from 'src/enum';

export class CreateModelDto {
  @IsNotEmpty()
  @IsString()
  name: string;
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

export class StatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DefaultStatus)
  status: DefaultStatus;
}
