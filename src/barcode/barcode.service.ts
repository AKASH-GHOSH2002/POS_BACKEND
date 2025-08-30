import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';

import { GenerateBarcodeDto } from './dto/generate-barcode.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { BarcodePrinter } from 'src/utils/barcode-printer.util';
import { DefaultStatus } from 'src/enum';

@Injectable()
export class BarcodeService {
  constructor(
    private readonly productService: ProductService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  private generateUniqueBarcode(productCode: string): string {
    const timestamp = Date.now().toString();
    return `${productCode}${timestamp.slice(-6)}`;
  }

  async generateBarcode(dto: GenerateBarcodeDto) {
    const product = await this.productService.findOne(dto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const barcodeImage = BarcodePrinter.generateBarcodeImage(product.sku);

    return barcodeImage;
  }

  async printBarcodes(productId: string, quantity: number) {
    const product = await this.productService.findOne(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const barcodeImage = BarcodePrinter.generateMultipleBarcodes([product.sku], quantity);

    return barcodeImage;
  }

  async scanBarcode(dto: ScanBarcodeDto, priceGroupId?: string, storeId?: string) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.inventory', 'inventory', 'inventory.storeId = :storeId', { storeId })
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.description',
        'product.imageUrl',
        'product.sellingPrice',
        'product.status',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
        'unit.id',
        'unit.name',
        'inventory.availableStock',
        'inventory.stock'
      ])
      .andWhere('product.status = :status', { status: DefaultStatus.ACTIVE })
      .andWhere('inventory.availableStock > 0');

    if (priceGroupId) {
      query.leftJoinAndSelect('product.productPrices', 'productPrices', 'productPrices.priceGroupId = :priceGroupId', { priceGroupId })
        .addSelect(['productPrices.price']);
    }

    const result = await query.getOne();
    return result;
  }
}