import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto, StatusDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PaginationDto } from 'src/account/dto/create-account.dto';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'model'])
  create(@Body() createModelDto: CreateModelDto) {
    return this.modelService.create(createModelDto);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'model'])
  findAll(@Query() dto: PaginationDto) {
    return this.modelService.findAll(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'model'])
  findAllByUser(@Query() dto: PaginationDto) {
    return this.modelService.findAllByUser(dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'model'])
  findOne(@Param('id') id: string) {
    return this.modelService.findOne(id);
  }

  @Patch('status/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'model'])
  updateStatus(@Param('id') id: string, @Body() statusDto: StatusDto) {
    return this.modelService.status(id, statusDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'model'])
  update(@Param('id') id: string, @Body() updateModelDto: UpdateModelDto) {
    return this.modelService.update(id, updateModelDto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'model'])
  remove(@Param('id') id: string) {
    return this.modelService.remove(id);
  }


 

}
