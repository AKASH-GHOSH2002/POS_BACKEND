import { IsString } from 'class-validator';

export class GenerateBarcodeDto {
  @IsString()
  productId: string;
}