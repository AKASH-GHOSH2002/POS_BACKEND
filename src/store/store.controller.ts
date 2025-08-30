import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto, PaginationDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Account } from 'src/account/entities/account.entity';
import { PermissionAction, UserRole } from 'src/enum';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'store'])
  @ApiOperation({ summary: 'Create store' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  create(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'store'])
  @ApiOperation({ summary: 'Get all stores' })
  @ApiResponse({ status: 200, description: 'Stores retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'Staff', required: false, type: String })
  findAll(@Query() dto: PaginationDto) {
    return this.storeService.findAll(dto);
  }

  @Get('account/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(...Object.values(UserRole)) // all roles allowed
  @CheckPermissions([PermissionAction.READ, 'store'])
  @ApiOperation({ summary: 'Get store by staff Account ID' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  findOneByStaff(@Param('id') id: string, @CurrentUser() account: Account) {
    return this.storeService.findOneByStff(account.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(...Object.values(UserRole))
  @CheckPermissions([PermissionAction.READ, 'store'])
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'store'])
  @ApiOperation({ summary: 'Update store' })
  @ApiResponse({ status: 200, description: 'Store updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.update(id, dto);
  }

  // @Post('transfer-stock')
  // @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  // @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  // @CheckPermissions([PermissionAction.UPDATE, 'store'])
  // @ApiOperation({ summary: 'Transfer stock between stores' })
  // @ApiResponse({ status: 200, description: 'Stock transferred successfully' })
  // transferStock(@Body() dto: { fromStoreId: string; toStoreId: string; productId: string; quantity: number }) {
  //   return this.storeService.transferStock(dto.fromStoreId, dto.toStoreId, dto.productId, dto.quantity);
  // }

  
}
