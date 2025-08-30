import { IsUUID, IsOptional, IsNumber, Min, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType, StockStatus } from 'src/enum';

export class StockMovementsDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  storeId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number = 0;
}

export class StockUpdateDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
export class StockAdjustmentDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
export class ReturnStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
export class ReserveStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;
}
export class PurchaseStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
export class InventoryPaginationDto {
  @IsOptional()
  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsUUID()
  modelId: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
  
   @IsOptional()
    @IsEnum(StockStatus)
    status: StockStatus;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  lowStock?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
export class CheckAvailabilityDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;
}
export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class TransferStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  fromStoreId: string;

  @IsUUID()
  toStoreId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsUUID()
  userId: string;
}