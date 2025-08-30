import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillItemService } from './bill-item.service';
import { BillItemController } from './bill-item.controller';
import { BillItem } from './entities/bill-item.entity';


@Module({
  imports: [TypeOrmModule.forFeature([BillItem])],
  controllers: [BillItemController],
  providers: [BillItemService],
  exports: [BillItemService],
})
export class BillItemModule {}
