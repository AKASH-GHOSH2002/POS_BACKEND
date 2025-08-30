import { Module } from '@nestjs/common';
import { BarcodeController } from './barcode.controller';
import { BarcodeService } from './barcode.service';
import { ProductModule } from '../product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ProductModule],
  controllers: [BarcodeController],
  providers: [BarcodeService],
  exports: [BarcodeService]
})
export class BarcodeModule { }