import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ReportDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;
}

export class CustomerHistoryDto {
  @IsUUID()
  customerId: string;
}

export class UnpaidBillsDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;
}