import { Controller, Get, Post, Body, Patch, Param, Query, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/create-inventory.dto';
import { BulkInventoryDto } from './dto/bulk-inventory.dto';
import { AdjustStockDto, CheckAvailabilityDto, InventoryPaginationDto, PurchaseStockDto, ReserveStockDto, ReturnStockDto, StockMovementsDto, StockUpdateDto, TransferStockDto } from './dto/stock-movements.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { Account } from 'src/account/entities/account.entity';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';


@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'inventory'])
  @ApiOperation({ summary: 'Add inventory' })
  @ApiResponse({ status: 201, description: 'Inventory added successfully' })
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Post('transfer')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'inventory'])
  @ApiOperation({ summary: 'Transfer stock between stores' })
  @ApiResponse({ status: 200, description: 'Stock transferred successfully' })
  transferStock(@Body() dto: TransferStockDto) {
    return this.inventoryService.transferStock(dto);
  }

  @Post('movements')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'inventory'])
  @ApiOperation({ summary: 'Get stock movements' })
  @ApiResponse({
    status: 200,
    description: 'Stock movements retrieved successfully',
  })
  getStockMovements(@Body() dto: StockMovementsDto) {
    return this.inventoryService.getStockMovements(dto);
  }

  @Post('check-availability')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'inventory'])
  @ApiOperation({ summary: 'Check stock availability' })
  @ApiResponse({ status: 200, description: 'Stock availability checked' })
  checkStockAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.inventoryService.checkStockAvailability(dto);
  }

  @Post('reserve')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'inventory'])
  @ApiOperation({ summary: 'Reserve stock' })
  @ApiResponse({ status: 200, description: 'Stock reserved successfully' })
  reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Post('release')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'inventory'])
  @ApiOperation({ summary: 'Release reserved stock' })
  @ApiResponse({
    status: 200,
    description: 'Reserved stock released successfully',
  })
  releaseReservedStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.releaseReservedStock(dto);
  }

  @Post('purchase')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'inventory'])
  @ApiOperation({ summary: 'Purchase stock' })
  @ApiResponse({ status: 200, description: 'Stock purchased successfully' })
  purchaseStock(@Body() dto: PurchaseStockDto) {
    return this.inventoryService.purchaseStock(dto);
  }

  @Post('return')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'inventory'])
  @ApiOperation({ summary: 'Return stock' })
  @ApiResponse({ status: 200, description: 'Stock returned successfully' })
  returnStock(@Body() dto: ReturnStockDto) {
    return this.inventoryService.returnStock(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'inventory'])
  @ApiOperation({ summary: 'Get all inventory with advanced filters' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  @ApiQuery({ name: 'minQuantity', required: false, type: Number })
  @ApiQuery({ name: 'maxQuantity', required: false, type: Number })
  findAll(@Query() dto: InventoryPaginationDto, @CurrentUser() user: any) {
    if (user.isStaff) dto.storeId = user.storeId;
    return this.inventoryService.findAll(dto);
  }

  @Get('product/:productId/stores')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'inventory'])
  @ApiOperation({ summary: 'Get product inventory across all stores' })
  @ApiResponse({
    status: 200,
    description: 'Product inventory retrieved successfully',
  })
  getProductInventoryAcrossStores(@Param('productId') productId: string) {
    return this.inventoryService.getProductInventoryAcrossStores(productId);
  }

  @Put('adjust')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'inventory'])
  @ApiOperation({ summary: 'Adjust stock' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }

  @Put('update-stock')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'inventory'])
  @ApiOperation({ summary: 'Update stock with movement type' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  updateStock(@Body() dto: StockUpdateDto) {
    return this.inventoryService.updateStock(dto);
  }
}