import { IsUUID, IsNumber, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsNumber()
  costPrice: number;
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  maxStock?: number;

  @IsOptional()
  @IsNumber()
  averageCostPrice?: number;
}