import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultStatus, YesNo } from 'src/enum';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(DefaultStatus)
  status: DefaultStatus;

  @IsOptional()
  @IsEnum(YesNo)
  hasType: YesNo;

  @IsOptional()
  @IsEnum(YesNo)
  hasSize: YesNo;

  @IsOptional()
  @IsEnum(YesNo)
  hasColor: YesNo;

  @IsOptional()
  @IsEnum(YesNo)
  hasCapacity: YesNo;

  @IsOptional()
  @IsEnum(YesNo)
  hasWeight: YesNo;

  @IsOptional()
  @IsEnum(YesNo)
  hasWarranty: YesNo;
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
export class DefaultStatusDto {
  @IsNotEmpty()
  @IsEnum(DefaultStatus)
  status: DefaultStatus;
}