import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPriceService } from './product-price.service';
import { ProductPriceController } from './product-price.controller';
import { ProductPrice } from './entities/product-price.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPrice]),AuthModule],
  controllers: [ProductPriceController],
  providers: [ProductPriceService],
  exports: [ProductPriceService],
})
export class ProductPriceModule {}