
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HoldProductItemDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @IsOptional()
    quantity: number;

    @IsOptional()
    @IsNumber()
    unitPrice: number; 
}

export class HoldBillTaxDto {
    @IsString()
    taxName: string;

    @IsNumber()
    taxPercent: number;

    @IsNumber()
    taxAmount: number;

    @IsOptional()
    @IsUUID()
    taxRateId?: string;
}

export class CreateHoldBillDto {
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
    @IsString()
    note: string;

    @IsOptional()
    @IsNumber()
    subtotal: number;

    @IsOptional()
    @IsNumber()
    taxAmount: number;

    @IsOptional()
    @IsNumber()
    total: number;

    @IsOptional()
    @IsNumber()
    totalBillAmount: number;

    @IsOptional()
    @IsNumber()
    previousDue: number;

    @IsUUID()
    priceGroupId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HoldProductItemDto)
    items: HoldProductItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HoldBillTaxDto)
    taxes?: HoldBillTaxDto[];
}
