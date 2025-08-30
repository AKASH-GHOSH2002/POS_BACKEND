import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Bill } from '../bill/entities/bill.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Expense } from '../expense/entities/expense.entity';
import { BillItem } from 'src/bill-item/entities/bill-item.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Customer, Expense,BillItem]),AuthModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService]
})
export class ReportModule {}