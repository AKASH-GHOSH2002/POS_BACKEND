import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('all-stores')
  @ApiOperation({ summary: 'Get dashboard metrics across all stores' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  getAllStoresDashboard() {
    return this.dashboardService.getAllStoresDashboard();
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get dashboard metrics for specific store' })
  @ApiResponse({ status: 200, description: 'Store dashboard metrics retrieved successfully' })
  getStoreDashboard(@Param('storeId') storeId: string) {
    return this.dashboardService.getStoreDashboard(storeId);
  }
}