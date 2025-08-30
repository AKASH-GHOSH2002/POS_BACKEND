import { PartialType } from '@nestjs/swagger';
import { CreateBillDto } from './create-bill.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  // @IsOptional()
  // @IsNumber()
  // paidAmount: number;
}