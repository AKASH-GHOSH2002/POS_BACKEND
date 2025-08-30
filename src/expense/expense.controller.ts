import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseReportDto } from './dto/expense-report.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Account } from 'src/account/entities/account.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionAction, UserRole } from 'src/enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Expense')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'expense'])
  @ApiOperation({ summary: 'Create expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: Account) {
    dto.accountId = user.id;
    return this.expenseService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'expense'])
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  findAll(@Query('storeId') storeId?: string) {
    return this.expenseService.findAll(storeId);
  }

  @Get('report')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'expense'])
  @ApiOperation({ summary: 'Get expense report' })
  @ApiResponse({
    status: 200,
    description: 'Expense report retrieved successfully',
  })
  getExpenseReport(
    @Query() dto: ExpenseReportDto,
    @CurrentUser() user: Account,
  ) {
    return this.expenseService.getExpenseReport(dto, user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'expense'])
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }
  
  @Get('export/report')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER, UserRole.SALES_STAFF)
  @CheckPermissions([PermissionAction.READ, 'expense'])
  @ApiOperation({ summary: 'Export expenses to Excel' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Expenses exported to Excel successfully',
  })
  async exportToExcel(@Query('storeId') storeId: string, @Res() res: Response) {
    const buffer = await this.expenseService.exportToExcel(storeId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.xlsx');
    res.send(buffer);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.UPDATE, 'expense'])
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.DELETE, 'expense'])
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  remove(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }
}
