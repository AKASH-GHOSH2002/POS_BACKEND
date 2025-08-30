import { Type } from 'class-transformer';
import { IsOptional, IsUUID, IsDateString, IsEnum, IsNumber, ValidateNested, IsString } from 'class-validator';
import { ReportPeriod } from 'src/enum';

export class SalesReportDto {
  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;
}


export class SalesReportResponse {
  @IsNumber()
  @IsOptional()
  totalSales: number;

  @IsNumber()
  @IsOptional()
  totalOrders: number;

  @IsNumber()
  @IsOptional()
  averageOrderValue: number;


  @Type(() => PeriodSalesData)
  periodData: PeriodSalesData[];

  @Type(() => StoreSalesData)
  storeWiseData: StoreSalesData[];
}


export class PeriodSalesData {
  @IsString()
  period: string;

  @IsNumber()
  sales: number;

  @IsNumber()
  orders: number;

  @IsString()
  date: string;
}


export class StoreSalesData {
  @IsString()
  storeId: string;

  @IsString()
  storeName: string;

  @IsNumber()
  totalSales: number;

  @IsNumber()
  totalOrders: number;

  @IsNumber()
  averageOrderValue: number;
}

