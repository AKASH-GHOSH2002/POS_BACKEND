import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BillStatus, PaymentMethod } from 'src/enum';

export class ProductItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice: number;

}

export class BillTaxDto {
  @IsString()
  @IsOptional()
  taxName: string;

  @IsNumber()
  @IsOptional()
  taxPercent: number;

  @IsNumber()
  @IsOptional()
  taxAmount: number;

  @IsOptional()
  @IsUUID()
  taxRateId: string;
}

export class CreateBillDto {
  @IsOptional()
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsNumber()
  discountAmount: number;

  @IsOptional()
  @IsNumber()
  discountPercent: number;

  @IsOptional()
  @IsNumber()
  paidAmount: number;

  @IsOptional()
  @IsNumber()
  dueAmount: number;

  @IsOptional()
  @IsNumber()
  prevDuePaidAmount: number;

  @IsOptional()
  @IsNumber()
  previousDue: number;

  @IsOptional()
  @IsEnum(BillStatus)
  status: BillStatus;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  totalBillAmount: number;

  @IsOptional()
  @IsNumber()
  taxAmount: number;

  @IsOptional()
  @IsNumber()
  total: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsUUID()
  @IsNotEmpty()
  priceGroupId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  items: ProductItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillTaxDto)
  taxes: BillTaxDto[];
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
  @IsString()
  @Transform(({ value }) => value?.toString()) 
  keyword?: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status: BillStatus;

  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  storeId: string;
}