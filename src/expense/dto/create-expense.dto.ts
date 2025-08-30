import { IsString, IsNumber, IsUUID, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsOptional()
  @IsUUID()
  accountId: string;
}