import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BarcodeService } from './barcode.service';
import { GenerateBarcodeDto } from './dto/generate-barcode.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionAction, UserRole } from 'src/enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Barcode')
@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) { }

  @Post('generate')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.CREATE, 'barcode'])
  @ApiOperation({ summary: 'Generate barcode' })
  @ApiResponse({ status: 201 })
  async generateBarcode(@Body() dto: GenerateBarcodeDto) {
    return this.barcodeService.generateBarcode(dto);
  }

  @Get('print/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'barcode'])
  @ApiOperation({ summary: 'Print barcodes for product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'quantity', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async printBarcodes(
    @Param('id') productId: string,
    @Query('quantity') quantity: string = '1',
  ) {
    return this.barcodeService.printBarcodes(productId, parseInt(quantity));
  }

  @Get('scan')
  @UseGuards(AuthGuard('jwt'), RolesGuard /*, PermissionsGuard */)
  @Roles(UserRole.ADMIN, UserRole.SALES_STAFF, UserRole.STAFF_MANAGER)
  @CheckPermissions([PermissionAction.READ, 'barcode'])
  @ApiOperation({ summary: 'Scan barcode' })
  @ApiQuery({ name: 'priceGroupId', required: false, description: 'Price group ID for pricing' })
  @ApiResponse({ status: 200 })
  async scanBarcode(
    @Body() dto: ScanBarcodeDto,
    @Query('priceGroupId') priceGroupId?: string,
  ) {
    const result = await this.barcodeService.scanBarcode(dto, priceGroupId);
    return result;
  }

}
