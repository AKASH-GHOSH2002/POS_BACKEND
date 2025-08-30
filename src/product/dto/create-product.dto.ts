import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultStatus, StockStatus } from 'src/enum';

export class ProductStoreDto {
  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  minStock: number;

  @IsOptional()
  @IsNumber()
  costPrice: number;
}

export class ProductPriceGroupDto {
  @IsUUID()
  priceGroupId: string;

  @IsNumber()
  price: number;


}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice: number;



  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockAlert: number;

  @IsOptional()
  @IsString()
  manufacturer: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  manufactureDate: Date;

  @IsOptional()
  @IsEnum(StockStatus)
  status: StockStatus;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  size: string;

  @IsOptional()
  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  capacity: string;

  @IsOptional()
  @IsString()
  weight: string;

  @IsOptional()
  @IsString()
  warranty: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  @IsUUID()
  brandId: string;

  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @IsOptional()
  @IsUUID()
  modelId: string;

  @IsOptional()
  @IsUUID()
  taxGroupId: string;

  @IsOptional()
  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductStoreDto)
  stores: ProductStoreDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceGroupDto)
  priceGroups: ProductPriceGroupDto[];
}

export class ProductPaginationDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  brandId: string;

  @IsOptional()
  @IsUUID()
  modelId: string;

  @IsOptional()
  @IsUUID()
  unitId: string;

  @IsOptional()
  @IsUUID()
  priceGroupId: string;

  @IsOptional()
  @IsUUID()
  accountId: string

  @IsOptional()
  @IsEnum(StockStatus)
  status: StockStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
}
export class PaginationDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  brandId: string;

  @IsOptional()
  @IsUUID()
  modelId: string;

  @IsOptional()
  @IsUUID()
  unitId: string;

  @IsNotEmpty()
  @IsString()
  priceGroupId: string;

  @IsOptional()
  @IsEnum(StockStatus)
  status: StockStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
}
export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(StockStatus)
  status: StockStatus;
}