import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, PaginationDto, ProductPaginationDto, UpdateStatusDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductExportDto } from './dto/product-export.dto';
import { AuthGuard } from '@nestjs/passport';
import { DefaultStatus, PermissionAction, StockStatus, UserRole } from 'src/enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ExcelUtil } from '../utils/excel.util';
import { Account } from 'src/account/entities/account.entity';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'product'])
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    if (user.isStaff) dto.storeId = user.storeId;
    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with full details' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(@Query() dto: ProductPaginationDto) {
    return this.productService.findAll(dto);
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get products for admin with filtering' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'unitId', required: false })
  @ApiQuery({ name: 'modelId', required: false })
  @ApiQuery({ name: 'taxGroupId', required: false })
  @ApiQuery({ name: 'priceGroupId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Admin products retrieved successfully',
  })
  findAllForAdmin(@Query() dto: ProductPaginationDto) {
    return this.productService.findAllForAdmin(dto);
  }

  @Get('sale/panel')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get products for customer' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'priceGroupId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Customer products retrieved successfully',
  })
  findAllForCustomer(
    @Query() dto: PaginationDto,
    @CurrentUser() account: Account,
  ) {
    return this.productService.findAllForSalePanel(dto, account.id);
  }

  @Get('billing/:storeId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get products for billing' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({
    name: 'priceGroupId',
    required: false,
    description: 'Filter by price group for billing',
  })
  @ApiResponse({
    status: 200,
    description: 'Products for billing retrieved successfully',
  })
  getProductsForBilling(
    @Param('storeId') storeId: string,
    @Query('keyword') keyword?: string,
    @Query('priceGroupId') priceGroupId?: string,
  ) {
    return this.productService.getProductsForBilling(
      storeId,
      keyword,
      priceGroupId,
    );
  }

  @Get('price-groups/active')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get active price groups for product creation' })
  @ApiResponse({
    status: 200,
    description: 'Active price groups retrieved successfully',
  })
  getActivePriceGroups() {
    return this.productService.getActivePriceGroups();
  }

  @Get('creation-data')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get product creation data with price groups' })
  @ApiResponse({
    status: 200,
    description: 'Product creation data retrieved successfully',
  })
  getProductCreationData() {
    return this.productService.getProductCreationData();
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Export products to Excel' })
  @ApiQuery({ name: 'priceGroupId', required: false })
  @ApiResponse({ status: 200, description: 'Products exported successfully' })
  async exportProducts(
    @Query() filters: ProductExportDto,
    @Res() res: Response,
  ) {
    const exportData = await this.productService.getProductsForExport(filters);
    const buffer = ExcelUtil.generateExcel(exportData, 'Products');
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    // res.send(buffer);
  }

  @Get(':id/with-prices')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get product with price groups' })
  @ApiResponse({
    status: 200,
    description: 'Product with prices retrieved successfully',
  })
  getProductWithPrices(@Param('id') id: string) {
    return this.productService.getProductWithPrices(id);
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get product by ID for admin' })
  @ApiResponse({
    status: 200,
    description: 'Admin product retrieved successfully',
  })
  findOneForAdmin(@Param('id') id: string) {
    return this.productService.findOneForAdmin(id);
  }

  @Get('sale/panel/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.SALES_STAFF, UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'product'])
  @ApiOperation({ summary: 'Get product by ID for customer' })
  @ApiQuery({ name: 'priceGroupId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Customer product retrieved successfully',
  })
  findOneForCustomer(
    @Param('id') id: string,
    @Query('priceGroupId') priceGroupId: string,
    @CurrentUser() user: Account,
  ) {
    return this.productService.findOneForsalePanel(id, priceGroupId, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'product'])
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Patch('status/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'product'])
  @ApiOperation({ summary: 'Update product status' })
  @ApiResponse({
    status: 200,
    description: 'Product status updated successfully',
  })
  updateProductStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.productService.updateStatus(id, dto);
  }

  @Put('uploadImage/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'product'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/Product',
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async image(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileData = await this.productService.findOne(id);
    return this.productService.image(file.path, fileData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'product'])
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  remove(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}