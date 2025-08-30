import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DefaultStatus } from 'src/enum';
import { ApiProperty } from '@nestjs/swagger';

export class ProductPriceDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  price: number;


}

export class CreatePriceGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DefaultStatus)
  status?: DefaultStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDto)
  productPrices?: ProductPriceDto[];
}

export class UpdatePriceGroupDto extends CreatePriceGroupDto {}

export class PriceGroupPaginationDto {
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
  @IsEnum(DefaultStatus)
  status: DefaultStatus;
}

export class StatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DefaultStatus)
  status: DefaultStatus
}