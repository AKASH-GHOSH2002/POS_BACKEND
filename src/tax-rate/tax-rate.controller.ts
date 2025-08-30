import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaxRateService } from './tax-rate.service';
import { CreateTaxRateDto, PaginationDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionAction, UserRole } from 'src/enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('Tax Rate')
@Controller('tax-rate')
export class TaxRateController {
  constructor(private readonly taxRateService: TaxRateService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.CREATE, 'tax_rate'])
  @ApiOperation({ summary: 'Create tax rate' })
  @ApiResponse({ status: 201, description: 'Tax rate created successfully' })
  async create(@Body() dto: CreateTaxRateDto) {
    return this.taxRateService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'tax_rate'])
  @ApiOperation({ summary: 'Get all tax rates' })
  @ApiResponse({ status: 200, description: 'Tax rates retrieved successfully' })
  async findAll(@Query() dto: PaginationDto) {
    return this.taxRateService.findAll(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'tax_rate'])
  @ApiOperation({ summary: 'Update tax rate' })
  @ApiResponse({ status: 200, description: 'Tax rate updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaxRateDto) {
    return this.taxRateService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'tax_rate'])
  @ApiOperation({ summary: 'Delete tax rate' })
  @ApiResponse({ status: 200, description: 'Tax rate deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.taxRateService.delete(id);
  }
}
