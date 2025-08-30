import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CategoryModule } from '../category/category.module';
import { ProductPriceModule } from '../product-price/product-price.module';
import { Category } from 'src/category/entities/category.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { Model } from 'src/model/entities/model.entity';
import { PriceGroup } from 'src/price-group/entities/price-group.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inventory, Category, Brand, Unit, Model, PriceGroup, StaffDetail]),
    CategoryModule,
    ProductPriceModule,
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }