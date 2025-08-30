import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Bill } from '../bill/entities/bill.entity';
import { BillItem } from '../bill-item/entities/bill-item.entity';
import { Product } from '../product/entities/product.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, BillItem, Product, Expense, Inventory])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}