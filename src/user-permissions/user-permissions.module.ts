import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Menu } from 'src/menus/entities/menu.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsService } from './user-permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserPermission, Menu, Permission]), forwardRef(() => AuthModule)],
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService],
  exports: [UserPermissionsService],
})
export class UserPermissionsModule {}
