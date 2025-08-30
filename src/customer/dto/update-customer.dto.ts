import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) { }

export class PaginationDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
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

export class UpdateDueAndPurchaseDto {
  @IsString()
  customerId: string;

  @IsNumber()
  dueAmount: number;

  @IsNumber()
  totalBillAmount: number;
}



export class UpdateDueDto {
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}