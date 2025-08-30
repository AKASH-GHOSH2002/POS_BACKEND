import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PaymentMethod } from "src/enum";

export class PayBillDto {
  @IsNumber()
  paidAmount: number;

   @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}
