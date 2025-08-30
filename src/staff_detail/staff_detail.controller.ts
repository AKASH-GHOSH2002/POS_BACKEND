import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  NotFoundException,
  UseGuards,
  Query,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StaffDetailService } from './staff_detail.service';
import {
  PaginationDto,
  UpdateStaffDetailDto,
} from './dto/update-staff_detail.dto';
import { StaffDetail } from './entities/staff_detail.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionAction, UserRole } from 'src/enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Account } from 'src/account/entities/account.entity';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@Controller('staff-detail')
export class StaffDetailController {
  constructor(private readonly staffService: StaffDetailService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'staff_detail'])
  findAll(@Query() dto: PaginationDto) {
    return this.staffService.findAll(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(...Object.values(UserRole))
  @CheckPermissions([PermissionAction.READ, 'staff_detail'])
  profile(@CurrentUser() user: Account) {
    return this.staffService.getProfile(user.id);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.STAFF_MANAGER, UserRole.ADMIN)
  @CheckPermissions([PermissionAction.UPDATE, 'staff_detail'])
  update(@CurrentUser() user: Account, @Body() dto: UpdateStaffDetailDto) {
    return this.staffService.update(user.id, dto);
  }

  @Put('uploadImage/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'staff_detail'])
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
    const fileData = await this.staffService.findOne(id);
    return this.staffService.uploadImage(file.path, fileData);
  }

  // @Delete(':id')
  // @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  // @Roles(UserRole.ADMIN)
  // @CheckPermissions([PermissionAction.DELETE, 'staff_detail'])
  // async deleteStaff(@Param('id') id: string) {
  //   const deleted = await this.staffService.deleteStaff(id);
  //   if (!deleted) {
  //     throw new NotFoundException(`Staff with ID ${id} not found`);
  //   }
  //   return { message: 'Staff deleted successfully' };
  // }
}
