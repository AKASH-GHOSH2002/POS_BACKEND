import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ProductPriceService } from '../product-price/product-price.service';
import { PriceGroup } from '../price-group/entities/price-group.entity';
import {
  CreateProductDto,
  PaginationDto,
  ProductPaginationDto,
  UpdateStatusDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from '../category/category.service';

import { Category } from 'src/category/entities/category.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Model } from 'src/model/entities/model.entity';
import { DefaultStatus, StockStatus } from 'src/enum';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly categoryService: CategoryService,
    private readonly productPriceService: ProductPriceService,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    @InjectRepository(PriceGroup)
    private readonly priceGroupRepository: Repository<PriceGroup>,
    @InjectRepository(StaffDetail)
    private readonly staffRepository: Repository<StaffDetail>,
  ) {}

  async create(dto: CreateProductDto) {
    const existingSku = await this.productRepository.findOne({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    const category = await this.categoryRepository.findOneBy({
      id: dto.categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found`,
      );
    }

    const brand = await this.brandRepository.findOneBy({ id: dto.brandId });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${dto.brandId} not found`);
    }

    const unit = await this.unitRepository.findOneBy({ id: dto.unitId });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${dto.unitId} not found`);
    }

    if (dto.modelId) {
      const model = await this.modelRepository.findOneBy({ id: dto.modelId });
      if (!model) {
        throw new NotFoundException(`Model with ID ${dto.modelId} not found`);
      }
    }

    const product = this.productRepository.create(dto);
    const savedProduct = await this.productRepository.save(product);

    if (!savedProduct) return { error: 'Failed to create product' };

    if (dto.storeId) {
      const existingInventory = await this.inventoryRepository.findOne({
        where: { productId: savedProduct.id, storeId: dto.storeId },
      });

      if (!existingInventory) {
        await this.inventoryRepository.save({
          productId: savedProduct.id,
          storeId: dto.storeId,
          stock: 0,
          availableStock: 0,
          reservedStock: 0,
          minStock: dto.lowStockAlert || 0,
          maxStock: 0,
          costPrice: dto.purchasePrice,
          averageCostPrice: dto.purchasePrice,
          isActive: true,
        });
      }
    }

    if (dto.stores?.length > 0) {
      for (const store of dto.stores) {
        const existingInventory = await this.inventoryRepository.findOne({
          where: { productId: savedProduct.id, storeId: store.storeId },
        });

        if (!existingInventory) {
          await this.inventoryRepository.save({
            productId: savedProduct.id,
            storeId: store.storeId,
            stock: store.stock || 0,
            availableStock: store.stock || 0,
            reservedStock: 0,
            minStock: store.minStock || 0,
            maxStock: 0,
            costPrice: store.costPrice || dto.purchasePrice,
            averageCostPrice: store.costPrice || dto.purchasePrice,
            isActive: true,
          });
        }
      }
    }

    const activePriceGroups = await this.getActivePriceGroups();

    if (activePriceGroups.result.length > 0) {
      for (const priceGroup of activePriceGroups.result) {
        const providedPrice = dto.priceGroups?.find(
          (pg) => pg.priceGroupId === priceGroup.id,
        );

        const priceData = {
          productId: savedProduct.id,
          priceGroupId: priceGroup.id,
          price: providedPrice?.price || dto.sellingPrice,
        };

        await this.productPriceService.create(priceData);
      }
    }

    return savedProduct;
  }

  async findAll(dto: ProductPaginationDto) {
    const [result, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.model', 'model')
      .leftJoinAndSelect('product.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.priceGroup', 'priceGroup')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.description',
        'product.imageUrl',
        'product.purchasePrice',
        'product.sellingPrice',
        'product.lowStockAlert',
        'product.status',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
        'unit.id',
        'unit.name',
        'model.id',
        'model.name',
        'productPrices.id',
        'productPrices.price',
        'priceGroup.id',
        'priceGroup.name',
        'inventory.id',
        'inventory.stock',
        'inventory.availableStock',
        'inventory.minStock',
      ])
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('product.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async findAllForAdmin(dto: ProductPaginationDto) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.model', 'model')
      .leftJoinAndSelect('product.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.priceGroup', 'priceGroup')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.description',
        'product.imageUrl',
        'product.purchasePrice',
        'product.sellingPrice',
        'product.lowStockAlert',
        'product.status',
        'product.createdAt',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
        'unit.id',
        'unit.name',
        'model.id',
        'model.name',
        'productPrices.id',
        'productPrices.price',
        'priceGroup.id',
        'priceGroup.name',
        'inventory.id',
        'inventory.stock',
        'inventory.availableStock',
        'inventory.minStock',
        'inventory.costPrice',
      ]);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('product.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          }).orWhere('product.sku LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    if (dto.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    if (dto.brandId) {
      query.andWhere('product.brandId = :brandId', { brandId: dto.brandId });
    }

    if (dto.unitId) {
      query.andWhere('product.unitId = :unitId', { unitId: dto.unitId });
    }

    if (dto.modelId) {
      query.andWhere('product.modelId = :modelId', { modelId: dto.modelId });
    }
    if (dto.status) {
      query.andWhere('product.status = :status', { status: dto.status });
    }

    if (dto.priceGroupId) {
      query.andWhere('productPrices.priceGroupId = :priceGroupId', {
        priceGroupId: dto.priceGroupId,
      });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('product.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async findAllForSalePanel(dto: PaginationDto, accountId: string) {
    const priceGroupId = dto.priceGroupId;
    if (!dto.priceGroupId) {
      throw new NotFoundException(
        'Price group ID is required for sale panel products',
      );
    }
    const staff = await this.staffRepository.findOne({
      where: { accountId: accountId },
      relations: ['store'],
    });

    if (!staff || !staff.store) {
      throw new NotFoundException(
        'Store not found for the given staff account',
      );
    }
    const storeId = staff.store.id;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect(
        'product.inventory',
        'inventory',
        'inventory.storeId = :storeId',
        { storeId },
      )
      .leftJoinAndSelect(
        'product.productPrices',
        'productPrices',
        'productPrices.priceGroupId = :priceGroupId',
        { priceGroupId },
      )
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.description',
        'product.imageUrl',
        'product.sellingPrice',
        'productPrices.price',
        'product.status',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
        'unit.id',
        'unit.name',
        'inventory.availableStock',
        'inventory.stock',
      ])
      .where('product.status != :status', { status: StockStatus.INACTIVE })
      .andWhere('inventory.availableStock > 0');

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('product.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          }).orWhere('product.sku LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    if (dto.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    if (dto.brandId) {
      query.andWhere('product.brandId = :brandId', { brandId: dto.brandId });
    }

    if (dto.status) {
      query.andWhere('product.status = :status', { status: dto.status });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('product.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async findOne(id: string) {
    if (!id) throw new NotFoundException('Product not found');
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.model', 'model')
      .leftJoinAndSelect('product.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.priceGroup', 'priceGroup')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.description',
        'product.imageUrl',
      ])
      .where('product.id = :id', { id })
      .getOne();

    if (!result) throw new NotFoundException('Product not found');
    return result;
  }

  async findOneForAdmin(id: string) {
    if (!id) throw new NotFoundException('Product not found');

    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.model', 'model')
      .leftJoinAndSelect('product.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.priceGroup', 'priceGroup')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.description',
        'product.imageUrl',
        'product.purchasePrice',
        'product.sellingPrice',
        'product.lowStockAlert',
        'product.status',
        'product.createdAt',
        'product.updatedAt',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
        'unit.id',
        'unit.name',
        'model.id',
        'model.name',
        'productPrices.id',
        'productPrices.price',
        'priceGroup.id',
        'priceGroup.name',
        'inventory.id',
        'inventory.stock',
        'inventory.availableStock',
        'inventory.minStock',
        'inventory.costPrice',
      ])
      .where('product.id = :id', { id })
      .getOne();

    if (!result) throw new NotFoundException('Product not found');
    return result;
  }

  async findOneForsalePanel(
    id: string,
    priceGroupId: string,
    accountId: string,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { accountId: accountId },
      relations: ['store'],
    });

    if (!staff || !staff.store) {
      throw new NotFoundException(
        'Store not found for the given staff account',
      );
    }
    const storeId = staff.store.id;
    if (!id) throw new NotFoundException('Product not found');

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect(
        'product.inventory',
        'inventory',
        'inventory.storeId = :storeId',
        { storeId },
      )
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
        'inventory.stock',
      ])
      .where('product.id = :id OR product.sku = :sku', { id, sku: id })
      .andWhere('product.status = :status', { status: StockStatus.IN_STOCK })
      .andWhere(
        '(inventory.availableStock > 0 OR inventory.availableStock IS NULL)',
      );

    if (priceGroupId) {
      query
        .leftJoinAndSelect(
          'product.productPrices',
          'productPrices',
          'productPrices.priceGroupId = :priceGroupId',
          { priceGroupId },
        )
        .addSelect(['productPrices.price']);
    }

    const result = await query.getOne();

    if (!result)
      throw new NotFoundException(
        'Product not found or not available in store',
      );
    return result;
  }

  async update(id: string, data: UpdateProductDto) {
    if (!id) throw new BadRequestException('Product ID is required');

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const { priceGroups, stores, ...productData } = data;

    await this.productRepository.update(id, productData);

    if (stores?.length > 0) {
      for (const store of stores) {
        const existing = await this.inventoryRepository.findOne({
          where: { productId: id, storeId: store.storeId },
        });

        if (existing) {
          if (store.stock !== undefined) {
            existing.stock = store.stock;
            existing.availableStock = store.stock - existing.reservedStock;
          }
          if (store.minStock !== undefined) existing.minStock = store.minStock;
          if (store.costPrice !== undefined) {
            existing.costPrice = store.costPrice;
            existing.averageCostPrice = store.costPrice;
          }
          await this.inventoryRepository.save(existing);
        } else {
          try {
            await this.inventoryRepository.save({
              productId: id,
              storeId: store.storeId,
              stock: store.stock || 0,
              availableStock: store.stock || 0,
              reservedStock: 0,
              minStock: store.minStock || 0,
              maxStock: 0,
              costPrice: store.costPrice || productData.purchasePrice,
              averageCostPrice: store.costPrice || productData.purchasePrice,
              isActive: true,
            });
          } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              continue;
            }
            throw error;
          }
        }
      }
    }

    if (priceGroups?.length > 0) {
      for (const pg of priceGroups) {
        const existing =
          await this.productPriceService.findByProductAndPriceGroup(
            id,
            pg.priceGroupId,
          );

        if (existing) {
          await this.productPriceService.update(existing.id, {
            price: pg.price,
          });
        } else {
          await this.productPriceService.create({
            productId: id,
            priceGroupId: pg.priceGroupId,
            price: pg.price,
          });
        }
      }
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, status: UpdateStatusDto) {
    if (!id) throw new BadRequestException('Product ID is required');

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    product.status = status.status;
    return this.productRepository.save(product);
  }

  async image(image: string, result: Product) {
    const obj = Object.assign(result, {
      imageUrl: process.env.POS_CDN_LINK + image,
      imagePath: image,
    });
    return await this.productRepository.save(obj);
  }

  async getProductsForBilling(
    storeId: string,
    keyword?: string,
    priceGroupId?: string,
  ) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect(
        'product.inventory',
        'inventory',
        'inventory.storeId = :storeId',
        { storeId },
      )
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.sellingPrice',
        'inventory.availableStock',
      ])
      .where('inventory.availableStock > 0');

    if (priceGroupId) {
      query
        .leftJoinAndSelect(
          'product.productPrices',
          'productPrice',
          'productPrice.priceGroupId = :priceGroupId',
          { priceGroupId },
        )
        .addSelect(['productPrice.price']);
    }

    if (keyword) {
      query.andWhere(
        '(product.name LIKE :keyword OR product.sku LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [result, total] = await query
      .orderBy('product.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async getActivePriceGroups() {
    const [result, total] = await this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .select(['priceGroup.id', 'priceGroup.name'])
      .where('priceGroup.status = :status', { status: 'ACTIVE' })
      .orderBy('priceGroup.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async getProductCreationData() {
    const priceGroups = await this.getActivePriceGroups();

    return {
      priceGroups: priceGroups.result.map((pg) => ({
        id: pg.id,
        name: pg.name,
        price: null,
      })),
    };
  }

  async getProductWithPrices(id: string) {
    const product = await this.findOne(id);
    const priceGroups = await this.productPriceService.findAll({
      productId: id,
      limit: 100,
      offset: 0,
    });

    return {
      ...product,
      priceGroups: priceGroups.result,
    };
  }

  async getProductsForExport(filters: any) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.model', 'model')
      .select(['product.name', 'product.sku', 'brand.name', 'model.name']);

    if (filters.priceGroupId) {
      query
        .leftJoin(
          'product.productPrices',
          'productPrice',
          'productPrice.priceGroupId = :priceGroupId',
          { priceGroupId: filters.priceGroupId },
        )
        .addSelect(['productPrice.price'])
        .andWhere('productPrice.priceGroupId = :priceGroupId', {
          priceGroupId: filters.priceGroupId,
        });
    } else {
      query.addSelect(['product.sellingPrice']);
    }

    const products = await query.orderBy('product.name', 'ASC').getMany();

    return products.map((product) => ({
      'Product Name': product.name,
      SKU: product.sku,
      Brand: product.brand?.name,
      Model: product.model?.name,
      Price: filters.priceGroupId
        ? product.productPrices?.[0]?.price
        : product.sellingPrice,
    }));
  }

  async delete(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException({
        success: false,
        message: 'Product not found',
      });
    }

    product.status = StockStatus.INACTIVE;
    await this.productRepository.save(product);

    return {
      success: true,
      message: 'Product marked as inactive successfully',
    };
  }
}
