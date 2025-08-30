import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { ReportDto } from './dto/report.dto';
import { ExcelUtil } from '../utils/excel.util';
import { Response } from 'express';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionAction, UserRole } from 'src/enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales/date-range')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'report'])
  @ApiOperation({ summary: 'Get sales report by date range' })
  @ApiResponse({
    status: 200,
    description: 'Sales report retrieved successfully',
  })
  getSalesReportByDateRange(
    @Query() dto: ReportDto,
    @Query('status') status?: string,
  ) {
    return this.reportService.getSalesReportByDateRange({ ...dto, status });
  }

  @Get('sales/daily')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'report'])
  @ApiOperation({ summary: 'Get daily sales report' })
  @ApiResponse({
    status: 200,
    description: 'Daily sales report retrieved successfully',
  })
  getDailySalesReport(
    @Query('date') date: string,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
  ) {
    return this.reportService.getDailySalesReport(date, storeId, status);
  }

  @Get('sales/seven-days')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'report'])
  @ApiOperation({ summary: 'Get seven days sales report' })
  @ApiResponse({
    status: 200,
    description: 'Seven days sales report retrieved successfully',
  })
  getSevenDaysSalesReport(
    @Query('selectedDate') selectedDate: string,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
  ) {
    return this.reportService.getSevenDaysSalesReport(
      selectedDate,
      storeId,
      status,
    );
  }

  @Get('export/sales/date-range')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'report'])
  @ApiOperation({ summary: 'Export sales report to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Sales report exported successfully',
  })
  async exportSalesReport(
    @Query() dto: ReportDto,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getSalesReportByDateRange({
      ...dto,
      status,
    });
    const buffer = ExcelUtil.generateExcel(data.result, 'Sales Report');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=sales-report.xlsx',
    );
    res.send(buffer);
  }

  @Get('export/sales/daily')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'report'])
  @ApiOperation({ summary: 'Export daily sales report to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Daily sales report exported successfully',
  })
  async exportDailySalesReport(
    @Query('date') date: string,
    @Query('storeId') storeId: string,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getDailySalesReport(
      date,
      storeId,
      status,
    );
    const buffer = ExcelUtil.generateExcel(data.result, 'Daily Sales Report');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=daily-sales-report.xlsx',
    );
    res.send(buffer);
  }

  @Get('export/sales/seven-days')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'report'])
  @ApiOperation({ summary: 'Export seven days sales report to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Seven days sales report exported successfully',
  })
  async exportSevenDaysSalesReport(
    @Query('selectedDate') selectedDate: string,
    @Query('storeId') storeId: string,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    const data = await this.reportService.getSevenDaysSalesReport(
      selectedDate,
      storeId,
      status,
    );
    const buffer = ExcelUtil.generateExcel(
      data.result,
      'Seven Days Sales Report',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=seven-days-sales-report.xlsx',
    );
    res.send(buffer);
  }
}
