import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { StockMovementModule } from '../stock-movement/stock-movement.module';
import { Store } from 'src/store/entities/store.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, Product, Store],),AuthModule,
    StockMovementModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}