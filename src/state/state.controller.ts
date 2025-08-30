import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { PaginationSDto, StateDto } from './dto/state.dto';
import { StateService } from './state.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';

@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'state'])
  create(@Body() dto: StateDto) {
    return this.stateService.create(dto);
  }

  @Get('list/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'state'])
  findAll(@Query() query: PaginationSDto) {
    const keyword = query.keyword || '';
    return this.stateService.findAll(
      query.limit,
      query.offset,
      keyword,
      query.status,
    );
  }

  @Get('list')
  find(@Query() query: PaginationSDto) {
    const keyword = query.keyword || '';
    return this.stateService.find(query.limit, query.offset, keyword);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'state'])
  update(@Param('id') id: string, @Body() dto: StateDto) {
    return this.stateService.update(+id, dto);
  }
}
