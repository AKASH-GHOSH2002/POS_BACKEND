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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { BrandPaginationDto, CreateBrandDto, DefaultStatusDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { PermissionAction, UserRole } from 'src/enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'brand'])
  @ApiOperation({ summary: 'Create brand' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'brand'])
  @ApiOperation({ summary: 'List brands' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200 })
  findAll(@Query() dto: BrandPaginationDto) {
    return this.brandService.findAll(dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER,UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'brand'])
  @ApiOperation({ summary: 'Get brand' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER,UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.UPDATE, 'brand'])
  @ApiOperation({ summary: 'Update brand' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Patch('status/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER,UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.UPDATE, 'brand'])
  @ApiOperation({ summary: 'Update brand status' })
  @ApiResponse({ status: 200, description: 'Brand status updated successfully' })
  updateBrandStatus(@Param('id') id: string, @Body() dto: DefaultStatusDto) {
    return this.brandService.updateBrandStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER,UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.DELETE, 'brand'])
  @ApiOperation({ summary: 'Delete brand' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  delete(@Param('id') id: string) {
    return this.brandService.remove(id);
  }

}
