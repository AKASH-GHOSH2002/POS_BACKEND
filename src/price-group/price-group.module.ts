import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceGroupService } from './price-group.service';
import { PriceGroupController } from './price-group.controller';
import { PriceGroup } from './entities/price-group.entity';
import { ProductPriceModule } from '../product-price/product-price.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceGroup]),
    ProductPriceModule,AuthModule
  ],
  controllers: [PriceGroupController],
  providers: [PriceGroupService],
  exports: [PriceGroupService],
})
export class PriceGroupModule {}