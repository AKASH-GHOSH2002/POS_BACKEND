import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { flatten, Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { TaxRateModule } from './tax-rate/tax-rate.module';

import { PriceGroupModule } from './price-group/price-group.module';
import { ProductPriceModule } from './product-price/product-price.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { UnitModule } from './unit/unit.module';
import { ProductModule } from './product/product.module';
import { BarcodeModule } from './barcode/barcode.module';
import { StoreModule } from './store/store.module';
import { CustomerModule } from './customer/customer.module';
import { InventoryModule } from './inventory/inventory.module';
import { StockMovementModule } from './stock-movement/stock-movement.module';
import { BillModule } from './bill/bill.module';
import { BillItemModule } from './bill-item/bill-item.module';
import { ExpenseModule } from './expense/expense.module';
import { ReportModule } from './report/report.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BackupModule } from './backup/backup.module';
import { PagesModule } from './pages/pages.module';
import { StaffDetailModule } from './staff_detail/staff_detail.module';
import { UserPermissionsModule } from './user-permissions/user-permissions.module';
import { MenusModule } from './menus/menus.module';
import { PermissionsModule } from './permissions/permissions.module';
import { SettingsModule } from './settings/settings.module';
import { ModelModule } from './model/model.module';
import { StateModule } from './state/state.module';
import { LoginHistoryModule } from './loginHistory/login-history.module';
import { BillTaxModule } from './bill-tax/bill-tax.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';



@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.POS_DB_HOST,
      port: Number(process.env.POS_DB_PORT),
      username: process.env.POS_USER_NAME,
      password: process.env.POS_DB_PASS,
      database: process.env.POS_DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize:false,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    AccountModule,
    TaxRateModule,

    PriceGroupModule,
    ProductPriceModule,
    CategoryModule,
    BrandModule,
    UnitModule,
    ProductModule,
    BarcodeModule,
    StoreModule,
    CustomerModule,
    InventoryModule,
    StockMovementModule,
    BillModule,
    BillItemModule,
    ExpenseModule,
    ReportModule,
    DashboardModule,
    BackupModule,
    PagesModule,
    StaffDetailModule,
    UserPermissionsModule,
    MenusModule,
    PermissionsModule,
    SettingsModule,
    ModelModule,
    StateModule,
    LoginHistoryModule,
    BillTaxModule,
    NotificationsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }