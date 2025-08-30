import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from 'src/enum';

export class ProcessPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  billId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  note: string;
}