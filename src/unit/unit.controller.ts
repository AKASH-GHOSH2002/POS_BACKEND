import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import { CreateUnitDto, UnitPaginationDto } from './dto/create-unit.dto';
import { UpdateUnitDto, UpdateUnitStatusDto } from './dto/update-unit.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Unit')
@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'unit'])
  @ApiOperation({ summary: 'Create unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(createUnitDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'unit'])
  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  findAll(@Query() paginationDto: UnitPaginationDto) {
    return this.unitService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'unit'])
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiResponse({ status: 200, description: 'Unit retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.unitService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'unit'])
  @ApiOperation({ summary: 'Update unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitService.update(id, updateUnitDto);
  }

  @Patch('status/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'unit'])
  @ApiOperation({ summary: 'Update unit status' })
  @ApiResponse({ status: 200, description: 'Unit status updated successfully' })
  updateUnitStatus(@Param('id') id: string, @Body() dto: UpdateUnitStatusDto) {
    return this.unitService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'unit'])
  @ApiOperation({ summary: 'Delete unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  delete(@Param('id') id: string) {
    return this.unitService.delete(id);
  }
}
