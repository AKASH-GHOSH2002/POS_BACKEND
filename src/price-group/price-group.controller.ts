import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PriceGroupService } from './price-group.service';
import {
  CreatePriceGroupDto,
  UpdatePriceGroupDto,
  PriceGroupPaginationDto,
  StatusDto,
} from './dto/create-price-group.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionAction, UserRole } from 'src/enum';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Price Group')
@Controller('price-group')
export class PriceGroupController {
  constructor(private readonly priceGroupService: PriceGroupService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'price_group'])
  @ApiOperation({ summary: 'Create price group' })
  @ApiResponse({ status: 201, description: 'Price group created successfully' })
  create(@Body() createPriceGroupDto: CreatePriceGroupDto) {
    return this.priceGroupService.create(createPriceGroupDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get all price groups' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({
    status: 200,
    description: 'Price groups retrieved successfully',
  })
  findAll(@Query() dto: PriceGroupPaginationDto) {
    return this.priceGroupService.findAll(dto);
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get price groups for admin with full details' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({
    status: 200,
    description: 'Admin price groups retrieved successfully',
  })
  findAllForAdmin(@Query() dto: PriceGroupPaginationDto) {
    return this.priceGroupService.findAllForAdmin(dto);
  }

  @Get('staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get active price groups for staff' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiResponse({
    status: 200,
    description: 'Staff price groups retrieved successfully',
  })
  findAllForStaff(@Query() dto: PriceGroupPaginationDto) {
    return this.priceGroupService.findAllForStaff(dto);
  }

  @Get('active')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get active price groups' })
  @ApiResponse({
    status: 200,
    description: 'Active price groups retrieved successfully',
  })
  getActivePriceGroups() {
    return this.priceGroupService.getActivePriceGroups();
  }

  @Get('product-price/:productId/:priceGroupId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get product price for specific price group' })
  @ApiResponse({
    status: 200,
    description: 'Product price retrieved successfully',
  })
  getProductPrice(
    @Param('productId') productId: string,
    @Param('priceGroupId') priceGroupId: string,
  ) {
    return this.priceGroupService.getProductPrice(productId, priceGroupId);
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({
    summary: 'Get price group by ID for admin with full details',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin price group retrieved successfully',
  })
  findOneForAdmin(@Param('id') id: string) {
    return this.priceGroupService.findOneForAdmin(id);
  }

  @Get('staff/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get active price group by ID for staff' })
  @ApiResponse({
    status: 200,
    description: 'Staff price group retrieved successfully',
  })
  findOneForStaff(@Param('id') id: string) {
    return this.priceGroupService.findOneForStaff(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'price_group'])
  @ApiOperation({ summary: 'Get price group by ID' })
  @ApiResponse({
    status: 200,
    description: 'Price group retrieved successfully',
  })
  findOne(@Param('id') id: string) {
    return this.priceGroupService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'price_group'])
  @ApiOperation({ summary: 'Update price group' })
  @ApiResponse({ status: 200, description: 'Price group updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updatePriceGroupDto: UpdatePriceGroupDto,
  ) {
    return this.priceGroupService.update(id, updatePriceGroupDto);
  }

  @Patch('status/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'model'])
  updateStatus(@Param('id') id: string, @Body() statusDto: StatusDto) {
    return this.priceGroupService.status(id, statusDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'price_group'])
  @ApiOperation({ summary: 'Delete price group' })
  @ApiResponse({ status: 200, description: 'Price group deleted successfully' })
  remove(@Param('id') id: string) {
    return this.priceGroupService.delete(id);
  }
}
