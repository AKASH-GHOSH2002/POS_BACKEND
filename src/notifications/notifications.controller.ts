import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionAction, UserRole, NotificationType } from 'src/enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationsService } from './notifications.service';
import { Account } from 'src/account/entities/account.entity';
import { NotificationDto, PaginationDto } from './dto/notification.dto';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger/dist/decorators';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('low-stock/:storeId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN) // ya jo role allow karna ho
  @ApiOperation({ summary: 'Get low stock items for a store' })
  @ApiResponse({
    status: 200,
    description: 'Low stock items retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No low stock items found' })
  getLowStock(
    @Param('storeId') storeId: string,
    @CurrentUser() user: Account, // yahan se accountId milega
  ) {
    return this.notificationsService.getOutOfStock(storeId, user.id);
  }

  // @Post('check-low-stock')
  // @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  // @Roles(UserRole.ADMIN, )
  // @CheckPermissions([PermissionAction.CREATE, 'notification'])
  // async checkLowStockProducts() {
  //   return await this.notificationsService.checkLowStockProducts();
  // }

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @CheckPermissions([PermissionAction.CREATE, 'notification'])
  async create(@Body() notificationDto: NotificationDto) {
    return await this.notificationsService.create(notificationDto);
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  @CheckPermissions([PermissionAction.READ, 'notification'])
  async findAllAdmin(
    @Query() dto: PaginationDto,
    @CurrentUser() user: Account,
  ) {
    return this.notificationsService.findAll(dto, user.id);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() dto: PaginationDto, @CurrentUser() user: Account) {
    return this.notificationsService.findAll(dto,user.id);
  }

  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  async getUnreadCount(@CurrentUser() user: Account) {
    return await this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body('status') status: boolean,
    @CurrentUser() user: Account,
  ) {
    return this.notificationsService.update(+id, user.id, status);
  }

  @Patch('mark-all-read')
  @UseGuards(AuthGuard('jwt'))
  async markAllAsRead(@CurrentUser() user: Account) {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  @Patch('mark-read/:id')
  @UseGuards(AuthGuard('jwt'))
  async markRead(@Param('id') id: string, @CurrentUser() user: Account) {
    return this.notificationsService.update(+id, user.id, true);
  }

  @Delete('clear-all')
  @UseGuards(AuthGuard('jwt'))
  async clearAllNotifications(@CurrentUser() user: Account) {
    return await this.notificationsService.clearAllNotifications(user.id);
  }

  // @Post('send-custom')
  // @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  // @Roles(UserRole.ADMIN, UserRole.STAFF)
  // @CheckPermissions([PermissionAction.CREATE, 'notification'])
  // async sendCustomNotification(
  //   @Body() body: { accountId: string; title: string; message: string; sendEmail?: boolean },
  // ) {
  //   return this.notificationsService.sendCustomNotification(
  //     body.accountId,
  //     body.title,
  //     body.message,
  //     body.sendEmail
  //   );
  // }

  // @Post('send-manual')
  // @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  // @Roles(UserRole.ADMIN, UserRole.STAFF)
  // @CheckPermissions([PermissionAction.CREATE, 'notification'])
  // async sendManualNotification(
  //   @Body() body: { accountIds: string[]; title: string; message: string; sendEmail?: boolean },
  // ) {
  //   return this.notificationsService.sendManualNotification(
  //     body.accountIds,
  //     body.title,
  //     body.message,
  //     body.sendEmail ?? false
  //   );
  // }
}
