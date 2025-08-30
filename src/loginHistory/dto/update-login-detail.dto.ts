import { Type } from 'class-transformer';
import { IsOptional, IsDateString, IsNotEmpty, IsNumber, Min, Max, IsString } from 'class-validator';

export class UpdateLoginDetailDto {}


export class PaginationDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(50)
  limit: number;

    @IsOptional()
    @IsString() 
    keyword?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  offset: number;

  @IsOptional()
  fromDate: string;

  @IsOptional()
  toDate: string;
}