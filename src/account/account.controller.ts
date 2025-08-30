import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto, PaginationDto, salesStaffDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

import { PermissionAction, UserRole } from 'src/enum';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Account } from './entities/account.entity';
import { MenusService } from 'src/menus/menus.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { UserPermissionsService } from 'src/user-permissions/user-permissions.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { DefaultStatus,  } from "src/enum";

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly menuService: MenusService,
    private readonly permissionService: PermissionsService,
    private readonly userPermService: UserPermissionsService,
  ) {}

@Post('add-staff_Manager')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
@CheckPermissions([PermissionAction.CREATE, 'account'])
async create(@Body() dto: CreateAccountDto, @CurrentUser() user: Account) {
  const account = await this.accountService.create(dto, user.id);
  const menus = await this.menuService.findAll();
  const perms = await this.permissionService.findAll();
  const obj: { accountId: string; menuId: number; permissionId: number }[] = [];

  menus.forEach((menu) => {
    perms.forEach((perm) => {
      obj.push({
        accountId: account.id,
        menuId: menu.id,
        permissionId: perm.id,
      });
    });
  });

  await this.userPermService.create(obj);
  return account;
}

@Post('add-salesStaff')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
@CheckPermissions([PermissionAction.CREATE, 'account'])
async createStaff(@Body() dto: salesStaffDto, @CurrentUser() user: Account) {
  const account = await this.accountService.staffcreate(dto, user.id);
  const menus = await this.menuService.findAll();
  const perms = await this.permissionService.findAll();
  const obj: { accountId: string; menuId: number; permissionId: number }[] = [];

  menus.forEach((menu) => {
    perms.forEach((perm) => {
      obj.push({
        accountId: account.id,
        menuId: menu.id,
        permissionId: perm.id,
      });
    });
  });

  await this.userPermService.create(obj);
  return account;
}

@Get('staff')
@ApiOperation({ summary: 'Get all accounts' })
@ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
@CheckPermissions([PermissionAction.READ, 'account'])
findAll(@Query() dto: PaginationDto) {
  return this.accountService.findAll(dto);
}

@Get('staff/profile/:id')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER,)
@CheckPermissions([PermissionAction.READ, 'account'])
async getstaffProfile(@Param('id') id: string) {
  return this.accountService.getstaffProfile(id);
}

@Patch('staff/status/:id')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
@CheckPermissions([PermissionAction.UPDATE, 'account'])
async updateStaffStatus(
  @Param('id') id: string,
  @Body() status: DefaultStatus,
) {
  return this.accountService.updateSatffStatus(id, status);
}



@Delete('staff/:id')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
@CheckPermissions([PermissionAction.DELETE, 'account'])
async deletesatffAccount(
  @Param('id') id: string,
  @CurrentUser() currentUser: Account,
) {
  return this.accountService.deletestaffAccount(id, currentUser);
}
}