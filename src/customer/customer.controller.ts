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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationDto, UpdateCustomerDto } from './dto/update-customer.dto';
import { PermissionAction, UserRole } from 'src/enum';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'customer'])
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'customer'])
  @ApiOperation({ summary: 'Get all customers with pagination' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiResponse({ status: 200, description: 'List of all customers' })
  async findAll(@Query() dto: PaginationDto) {
    return this.customerService.findAll(dto);
  }

  @Get('store/:storeId')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'customer'])
  @ApiOperation({ summary: 'Get customers by store with pagination' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiQuery({ name: 'limit', required: true })
  @ApiQuery({ name: 'offset', required: true })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiResponse({ status: 200, description: 'List of customers for the store' })
  findByStore(
    @Param('storeId') storeId: string,
    @Query() dto: PaginationDto,
  ) {
    return this.customerService.findCustomersByStoreId(storeId, dto);
  }

  @Get('search/:query')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'customer'])
  @ApiOperation({ summary: 'Search customers' })
  @ApiParam({ name: 'query', description: 'Search query (name, phone, or ID)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchCustomers(
    @Param('query') query: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.customerService.searchCustomers(query, storeId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'customer'])
  @ApiOperation({ summary: 'Get single customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'customer'])
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  @Get('dues/list')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'customer'])
  @ApiOperation({ summary: 'Get customers with dues' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({ status: 200, description: 'Customers with outstanding dues' })
  getCustomerDues(@Query('storeId') storeId?: string) {
    return this.customerService.getCustomerDues(storeId);
  }

  @Get('dues/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'customer'])
  @ApiOperation({ summary: 'Get customer with detailed dues and ledger' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer with dues details' })
  getCustomerWithDues(@Param('id') id: string) {
    return this.customerService.getCustomerWithDues(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'customer'])
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.customerService.delete(id);
  }

}
