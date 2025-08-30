import { Module } from '@nestjs/common';
import { BillTaxService } from './bill-tax.service';
import { BillTaxController } from './bill-tax.controller';

@Module({
  controllers: [BillTaxController],
  providers: [BillTaxService],
})
export class BillTaxModule {}
