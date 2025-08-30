import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { PaginationDto } from './dto/pagination.dto';
import { SettingDto } from './dto/setting.dto';
import { StatusSettingDto } from './dto/status-setting.dto';
import { SettingsService } from './settings.service';
import { PermissionAction, UserRole } from '../enum';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';

@Controller('settings')
export class SettingsController {
  version = new Date();
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'setting'])
  create(@Body() dto: SettingDto) {
    return this.settingsService.create(dto);
  }

  @Get('default')
  findSettings(@Headers('origin') origin: string) {
    return this.settingsService.findSetting('http://localhost:5892');
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':id')
 @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'setting'])
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'setting'])
  update(@Param('id') id: string, @Body() dto: SettingDto) {
    return this.settingsService.update(id, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN,UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'setting'])
  status(@Param('id') id: string, @Body() dto: StatusSettingDto) {
    return this.settingsService.status(id, dto);
  }
}
