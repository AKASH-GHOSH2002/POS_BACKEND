import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ProductPrice } from './entities/product-price.entity';
import {
  CreateProductPriceDto,
  UpdateProductPriceDto,
  ProductPricePaginationDto,
  BulkProductPriceDto,
} from './dto/create-product-price.dto';

@Injectable()
export class ProductPriceService {
  constructor(
    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,
  ) {}

  async create(dto: CreateProductPriceDto) {
    const existing = await this.productPriceRepository.findOne({
      where: {
        productId: dto.productId,
        priceGroupId: dto.priceGroupId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Price already exists for this product in this price group',
      );
    }

    const productPrice = this.productPriceRepository.create(dto);
    return this.productPriceRepository.save(productPrice);
  }

  async bulkCreate(dto: BulkProductPriceDto) {
    await this.productPriceRepository.delete({
      priceGroupId: dto.priceGroupId,
    });

    const productPrices = dto.products.map((product) => ({
      ...product,
      priceGroupId: dto.priceGroupId,
    }));

    return this.productPriceRepository.save(productPrices);
  }

  async findAll(dto: ProductPricePaginationDto) {
    const query = this.productPriceRepository
      .createQueryBuilder('productPrice')
      .leftJoinAndSelect('productPrice.product', 'product')
      .leftJoinAndSelect('productPrice.priceGroup', 'priceGroup')
      .select([
        'productPrice.id',
        'productPrice.price',
        'product.id',
        'product.name',
        'product.sku',
        'priceGroup.id',
        'priceGroup.name',
      ]);

    if (dto.priceGroupId) {
      query.andWhere('productPrice.priceGroupId = :priceGroupId', {
        priceGroupId: dto.priceGroupId,
      });
    }

    if (dto.productId) {
      query.andWhere('productPrice.productId = :productId', {
        productId: dto.productId,
      });
    }

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

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('product.name', 'ASC')
      .getManyAndCount();

    return { result, total };
  }

  async findOne(id: string) {
    const result = await this.productPriceRepository
      .createQueryBuilder('productPrice')
      .leftJoinAndSelect('productPrice.product', 'product')
      .leftJoinAndSelect('productPrice.priceGroup', 'priceGroup')
      .where('productPrice.id = :id', { id })
      .getOne();

    if (!result) {
      throw new NotFoundException('Product price not found');
    }

    return result;
  }

  async findByProductAndPriceGroup(productId: string, priceGroupId: string) {
    const result = await this.productPriceRepository
      .createQueryBuilder('productPrice')
      .select(['productPrice.id', 'productPrice.price'])
      .where('productPrice.productId = :productId', { productId })
      .andWhere('productPrice.priceGroupId = :priceGroupId', { priceGroupId })
      .getOne();

    return result;
  }

  async update(id: string, dto: UpdateProductPriceDto) {
    const productPrice = await this.productPriceRepository.findOne({
      where: { id },
    });

    if (!productPrice) {
      throw new NotFoundException('Product price not found');
    }

    // Only update the price, don't check for conflicts since we're updating existing record
    productPrice.price = dto.price;
    return this.productPriceRepository.save(productPrice);
  }

  async delete(id: string) {
    return this.productPriceRepository.delete(id);
  }

  async deleteByPriceGroup(priceGroupId: string) {
    return this.productPriceRepository.delete({ priceGroupId });
  }
}
