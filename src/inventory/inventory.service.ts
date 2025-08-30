import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { MovementType } from 'src/enum';
import { StockMovementService } from '../stock-movement/stock-movement.service';
import { Product } from '../product/entities/product.entity';
import { Store } from '../store/entities/store.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventory } from './dto/bulk-inventory.dto';
import {
  AdjustStockDto,
  CheckAvailabilityDto,
  InventoryPaginationDto,
  PurchaseStockDto,
  ReserveStockDto,
  ReturnStockDto,
  StockMovementsDto,
  StockUpdateDto,
  TransferStockDto,
} from './dto/stock-movements.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private stockMovementService: StockMovementService,
    private notificationService: NotificationsService,
  ) {}

  async create(dto: CreateInventoryDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const store = await this.storeRepository.findOne({
      where: { id: dto.storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const existing = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.storeId },
    });
    if (existing) throw new BadRequestException('Inventory already exists');

    const inventory = this.inventoryRepository.create({
      productId: dto.productId,
      storeId: dto.storeId,
      stock: dto.quantity,
      availableStock: dto.quantity,
      costPrice: dto.costPrice,
      averageCostPrice: dto.costPrice,
      minStock: dto.minStock || 0,
      reservedStock: 0,
      isActive: true,
    });

    const savedInventory = await this.inventoryRepository.save(inventory);

    await this.stockMovementService.create({
      productId: dto.productId,
      storeId: dto.storeId,
      quantity: dto.quantity,
      type: MovementType.PURCHASE,
      previousStock: 0,
      newStock: dto.quantity,
      notes: 'Initial stock creation',
    });

    return savedInventory;
  }

  async findAll(dto: InventoryPaginationDto) {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin('inventory.store', 'store')
      .select([
        'inventory.id',
        'inventory.stock',
        'inventory.availableStock',
        'inventory.reservedStock',
        'inventory.minStock',
        'inventory.costPrice',
        'inventory.createdAt',
        'product.id',
        'product.name',
        'product.sku',
        'product.brandId',
        'product.modelId',
        'product.status',
        'category.id',
        'category.name',
        'store.id',
        'store.name',
      ])
      .where('inventory.isActive = :isActive', { isActive: true });

    if (dto.storeId) {
      query.andWhere('inventory.storeId = :storeId', { storeId: dto.storeId });
    }

    if (dto.productId) {
      query.andWhere('inventory.productId = :productId', {
        productId: dto.productId,
      });
    }

    if (dto.brandId) {
      query.andWhere('product.brandId = :brandId', { brandId: dto.brandId });
    }

    if (dto.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    if (dto.modelId) {
      query.andWhere('product.modelId = :modelId', { modelId: dto.modelId });
    }

    if (dto.status) {
      query.andWhere('product.status = :status', { status: dto.status });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('inventory.createdAt', 'DESC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { total, result };
  }

  async updateStock(dto: StockUpdateDto) {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.storeId },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');

    const previousStock = inventory.stock;
    let newStock = inventory.stock;

    if (
      dto.type === MovementType.PURCHASE ||
      dto.type === MovementType.RETURN
    ) {
      newStock += dto.quantity;
    } else if (dto.type === MovementType.SALE) {
      if (inventory.availableStock < dto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      newStock -= dto.quantity;
    } else if (dto.type === MovementType.ADJUSTMENT) {
      newStock = dto.quantity;
    } else {
      throw new BadRequestException('Invalid movement type');
    }

    inventory.stock = newStock;
    inventory.availableStock = newStock - inventory.reservedStock;

    await this.inventoryRepository.save(inventory);
    await this.stockMovementService.create({ ...dto, previousStock, newStock });

    return inventory;
  }

  async saleStock(dto: UpdateInventory) {
    return this.updateStock({
      ...dto,
      type: MovementType.SALE,
      notes: 'Stock sale',
    });
  }

  async adjustStock(dto: AdjustStockDto) {
    return this.updateStock({
      ...dto,
      type: MovementType.ADJUSTMENT,
    });
  }

  async purchaseStock(dto: PurchaseStockDto) {
    return this.updateStock({
      ...dto,
      type: MovementType.PURCHASE,
      notes: 'Stock purchase',
    });
  }

  async returnStock(dto: ReturnStockDto) {
    return this.updateStock({
      ...dto,
      type: MovementType.RETURN,
      notes: 'Stock return',
    });
  }
  async transferStock(dto: TransferStockDto) {
    const sourceInventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.fromStoreId },
    });
    if (!sourceInventory)
      throw new NotFoundException('Source inventory not found');
    if (sourceInventory.availableStock < dto.quantity) {
      throw new BadRequestException('Insufficient stock in source store');
    }

    let destInventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.toStoreId },
    });
    if (!destInventory) {
      const product = await this.productRepository.findOne({
        where: { id: dto.productId },
      });
      destInventory = this.inventoryRepository.create({
        productId: dto.productId,
        storeId: dto.toStoreId,
        stock: 0,
        availableStock: 0,
        reservedStock: 0,
        costPrice: sourceInventory.costPrice,
        averageCostPrice: sourceInventory.averageCostPrice,
        minStock: 0,
        isActive: true,
      });
    }

    const sourcePreviousStock = sourceInventory.stock;
    const destPreviousStock = destInventory.stock;

    sourceInventory.stock -= dto.quantity;
    sourceInventory.availableStock -= dto.quantity;
    destInventory.stock += dto.quantity;
    destInventory.availableStock += dto.quantity;

    await this.inventoryRepository.save([sourceInventory, destInventory]);

    await this.stockMovementService.create({
      productId: dto.productId,
      storeId: dto.fromStoreId,
      quantity: -dto.quantity,
      type: MovementType.TRANSFER,
      previousStock: sourcePreviousStock,
      newStock: sourceInventory.stock,
      notes: `Transfer out to store: ${dto.toStoreId}`,
      reference: dto.notes,
      userId: dto.userId,
    });

    await this.stockMovementService.create({
      productId: dto.productId,
      storeId: dto.toStoreId,
      quantity: dto.quantity,
      type: MovementType.TRANSFER,
      previousStock: destPreviousStock,
      newStock: destInventory.stock,
      notes: `Transfer in from store: ${dto.fromStoreId}`,
      reference: dto.notes,
      userId: dto.userId,
    });

    return {
      message: 'Stock transferred successfully',
      sourceStore: {
        storeId: dto.fromStoreId,
        remainingStock: sourceInventory.stock,
      },
      destinationStore: {
        storeId: dto.toStoreId,
        newStock: destInventory.stock,
      },
    };
  }

  async getProductInventoryAcrossStores(productId: string) {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .select([
        'inventory.id',
        'inventory.stock',
        'inventory.availableStock',
        'inventory.reservedStock',
        'inventory.costPrice',
        'store.id',
        'store.name',
      ])
      .leftJoin('inventory.store', 'store')
      .where('inventory.productId = :productId', { productId })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .orderBy('inventory.createdAt', 'DESC');

    const [result, total] = await query.getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { total, result };
  }

  async getStockMovements(dto: StockMovementsDto) {
    return this.stockMovementService.getMovements({
      productId: dto.productId,
      storeId: dto.storeId,
      limit: dto.limit || 50,
      offset: dto.offset || 0,
    });
  }

  async checkStockAvailability(dto: CheckAvailabilityDto): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.storeId },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');

    return inventory.availableStock >= dto.quantity;
  }

  async reserveStock(dto: ReserveStockDto) {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.storeId },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');

    if (inventory.availableStock < dto.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    inventory.reservedStock += dto.quantity;
    inventory.availableStock -= dto.quantity;

    return this.inventoryRepository.save(inventory);
  }

  async releaseReservedStock(dto: ReserveStockDto) {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId: dto.productId, storeId: dto.storeId },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');

    inventory.reservedStock = Math.max(
      0,
      inventory.reservedStock - dto.quantity,
    );
    inventory.availableStock = inventory.stock - inventory.reservedStock;

    return this.inventoryRepository.save(inventory);
  }
}
