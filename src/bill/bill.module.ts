import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { Bill } from './entities/bill.entity';
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { BillItem } from 'src/bill-item/entities/bill-item.entity';
import { Customer } from 'src/customer/entities/customer.entity';

import { ProductPriceModule } from 'src/product-price/product-price.module';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { TaxRate } from 'src/tax-rate/entities/tax-rate.entity';
import { InventoryModule } from 'src/inventory/inventory.module';
import { CustomerModule } from 'src/customer/customer.module';
import { BillTax } from 'src/bill-tax/entities/bill-tax.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bill,
      BillItem,
      Product,
      Inventory,
      Customer,

      StaffDetail,
      TaxRate,
      BillTax,
    ]),
    ProductPriceModule,
    InventoryModule,
    CustomerModule,
    AuthModule,
  ],

  controllers: [BillController],
  providers: [BillService],
  exports: [BillService],
})
export class BillModule {}
