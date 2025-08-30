import { IsUUID, IsNumber, IsArray, ValidateNested, IsString, IsOptional, Min, Max, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultStatus } from 'src/enum';

export class BulkInventoryItemDto {
  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  costPrice: number;
}

export class BulkInventoryDto {
  @IsUUID()
  productId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkInventoryItemDto)
  stores: BulkInventoryItemDto[];
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
  storeId: string;

}
export class UpdateInventory {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsNumber()
  @IsOptional()
  quantity: number;
}

