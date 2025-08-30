import { IsNotEmpty, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPriceDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsUUID()
  priceGroupId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}

export class BulkProductPriceDto {
  @IsNotEmpty()
  @IsUUID()
  priceGroupId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceItem)
  products: ProductPriceItem[];
}

export class ProductPriceItem {
  @IsUUID()
  productId: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}

export class UpdateProductPriceDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  priceGroupId?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}

export class ProductPricePaginationDto {
  priceGroupId?: string;
  productId?: string;
  keyword?: string;
  limit: number = 10;
  offset: number = 0;
}