import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ExpenseReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  storeId: string;
}