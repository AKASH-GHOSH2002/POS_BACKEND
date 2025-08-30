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
import { CategoryService } from './category.service';
import { CreateCategoryDto, DefaultStatusDto, PaginationDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'category'])
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'category'])
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200 })
  findAll(@Query() dto: PaginationDto) {
    return this.categoryService.findAll(dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'category'])
  @ApiOperation({ summary: 'Get category' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'category'])
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Patch('status/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'category'])
  @ApiOperation({ summary: 'Update category status' })
  @ApiResponse({ status: 200, description: 'Category status updated successfully' })
  updateCategoryStatus(@Param('id') id: string, @Body() dto: DefaultStatusDto) {
    return this.categoryService.updateCategoryStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'category'])
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
