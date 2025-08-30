import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductPriceService } from './product-price.service';
import { CreateProductPriceDto, UpdateProductPriceDto, ProductPricePaginationDto, BulkProductPriceDto } from './dto/create-product-price.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionAction, UserRole } from 'src/enum';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';


  @ApiTags('Product Price')
  @Controller('product-price')
  export class ProductPriceController {
    constructor(private readonly productPriceService: ProductPriceService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.CREATE, 'product_price'])
    @ApiOperation({ summary: 'Create product price' })
    @ApiResponse({
      status: 201,
      description: 'Product price created successfully',
    })
    create(@Body() createProductPriceDto: CreateProductPriceDto) {
      return this.productPriceService.create(createProductPriceDto);
    }

    @Post('bulk')
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.CREATE, 'product_price'])
    @ApiOperation({
      summary: 'Bulk create/update product prices for price group',
    })
    @ApiResponse({
      status: 201,
      description: 'Product prices updated successfully',
    })
    bulkCreate(@Body() bulkProductPriceDto: BulkProductPriceDto) {
      return this.productPriceService.bulkCreate(bulkProductPriceDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.CREATE, 'product_price'])
    @ApiOperation({ summary: 'Get all product prices' })
    @ApiQuery({ name: 'limit', required: true })
    @ApiQuery({ name: 'offset', required: true })
    @ApiQuery({ name: 'priceGroupId', required: false })
    @ApiQuery({ name: 'productId', required: false })
    @ApiQuery({ name: 'keyword', required: false })
    @ApiResponse({
      status: 200,
      description: 'Product prices retrieved successfully',
    })
    findAll(@Query() dto: ProductPricePaginationDto) {
      return this.productPriceService.findAll(dto);
    }

    @Get('lookup/:productId/:priceGroupId')
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.READ, 'product_price'])
    @ApiOperation({ summary: 'Get product price for specific price group' })
    @ApiResponse({
      status: 200,
      description: 'Product price retrieved successfully',
    })
    findByProductAndPriceGroup(
      @Param('productId') productId: string,
      @Param('priceGroupId') priceGroupId: string,
    ) {
      return this.productPriceService.findByProductAndPriceGroup(
        productId,
        priceGroupId,
      );
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.READ, 'product_price'])
    @ApiOperation({ summary: 'Get product price by ID' })
    @ApiResponse({
      status: 200,
      description: 'Product price retrieved successfully',
    })
    findOne(@Param('id') id: string) {
      return this.productPriceService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.UPDATE, 'product_price'])
    @ApiOperation({ summary: 'Update product price' })
    @ApiResponse({
      status: 200,
      description: 'Product price updated successfully',
    })
    update(
      @Param('id') id: string,
      @Body() updateProductPriceDto: UpdateProductPriceDto,
    ) {
      return this.productPriceService.update(id, updateProductPriceDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
    @CheckPermissions([PermissionAction.DELETE, 'product_price'])
    @ApiOperation({ summary: 'Delete product price' })
    @ApiResponse({
      status: 200,
      description: 'Product price deleted successfully',
    })
    remove(@Param('id') id: string) {
      return this.productPriceService.delete(id);
    }
  }