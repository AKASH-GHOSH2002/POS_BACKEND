import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
  Res,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BillService } from './bill.service';
import { CreateBillDto, PaginationDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { ProcessPaymentDto } from './dto/payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { Account } from 'src/account/entities/account.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PayBillDto } from './dto/pay-bill.dto';
import { CreateHoldBillDto } from './dto/hold-bill.dto';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Bill')
@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.CREATE, 'bill'])
  @ApiOperation({ summary: 'Create bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  create(@Body() dto: CreateBillDto, @CurrentUser() user: Account) {
    return this.billService.create(dto, user.id);
  }

  @Post('hold')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, )
  @CheckPermissions([PermissionAction.CREATE, 'bill'])
  @ApiOperation({ summary: 'Create hold bill' })
  @ApiResponse({ status: 201, description: 'Hold bill created successfully' })
  createHoldBill(@Body() dto: CreateHoldBillDto, @CurrentUser() user: Account) {
    return this.billService.createHoldBill(dto, user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.STAFF_MANAGER, UserRole.ADMIN, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'bill'])
  @ApiOperation({ summary: 'List bills' })
  @ApiResponse({ status: 200 })
  findAll(@Query() dto: PaginationDto) {
    return this.billService.findAll(dto);
  }

  @Get('storebills')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.SALES_STAFF,UserRole.ADMIN,UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'bill'])
  @ApiOperation({
    summary: 'Get bills for the sales staff store with filters and pagination',
  })
  @ApiResponse({ status: 200, description: 'Bills list' })
  getBillsByStore(@CurrentUser() user: Account, @Query() dto: PaginationDto) {
    return this.billService.findBillsByStore(user.id, dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'bill'])
  @ApiOperation({ summary: 'Get bill' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Patch('payHoldBill/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'bill'])
  @ApiOperation({ summary: 'Pay hold bill' })
  @ApiResponse({ status: 200 })
  async payHoldBill(@Param('id') billId: string, @Body() dto: PayBillDto) {
    return this.billService.payHoldBill(billId, dto);
  }

  @Get('invoice/:id')
  async downloadInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.billService.generateInvoicePdf(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice_${id}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      return res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).json({
          success: false,
          message: error.message || 'Bill not found',
        });
      }

      console.error('PDF Generation Error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to generate invoice PDF. Please try again later.',
      });
    }
  }

  @Delete('cancelHoldBill/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard , PermissionsGuard )
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'bill'])
  @ApiOperation({ summary: 'Cancel (remove) a hold bill if not paid' })
  @ApiResponse({ status: 200 })
  async cancelHoldBill(@Param('id') billId: string) {
    return this.billService.cancelHoldBill(billId);
  }
}
