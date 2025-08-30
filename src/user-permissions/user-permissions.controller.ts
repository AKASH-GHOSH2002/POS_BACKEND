import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { UpdatePermissionDto, UpdateUserPermissionDto,  } from './dto/permission.dto';
import { UserPermissionsService } from './user-permissions.service';

@Controller('user-permissions')
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsService: UserPermissionsService,
  ) {}
 @Get(':id')
  findAll( @Param('id') id: string) {
    return this.userPermissionsService.findAll(id);
  }
  
@Put(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
@CheckPermissions([PermissionAction.UPDATE, 'user_permission'])
async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
  const obj: UpdateUserPermissionDto[] = [];

  dto.menu.forEach((menuItem) => {
    menuItem.userPermission.forEach((permItem) => {
      obj.push({
        id: permItem.id,
        accountId: permItem.accountId,
        menuId: menuItem.id,
        permissionId: permItem.permission.id,
        status: permItem.status,
      });
    });
  });

  this.userPermissionsService.create(obj);
  return { menu: dto.menu };
}

}
