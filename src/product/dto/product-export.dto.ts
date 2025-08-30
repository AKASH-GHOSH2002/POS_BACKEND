import { IsOptional, IsUUID, IsString, IsEnum } from 'class-validator';
import { DefaultStatus } from 'src/enum';

export class ProductExportDto {
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
  unitId: string;

  @IsOptional()
  @IsUUID()
  modelId: string;

  @IsOptional()
  @IsEnum(DefaultStatus)
  status: DefaultStatus;

  @IsOptional()
  @IsUUID()
  priceGroupId: string;

  @IsOptional()
  @IsString()
  fields?: string; // comma-separated field names
}