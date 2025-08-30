import { Module, forwardRef } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './entities/account.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusModule } from 'src/menus/menus.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { UserPermissionsModule } from 'src/user-permissions/user-permissions.module';
import { StaffDetailModule } from 'src/staff_detail/staff_detail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, StaffDetail]),
    forwardRef(() => AuthModule), MenusModule,
    PermissionsModule,
    UserPermissionsModule,
    StaffDetailModule,
  
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule { }