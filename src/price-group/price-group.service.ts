import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PriceGroup } from './entities/price-group.entity';
import { ProductPriceService } from '../product-price/product-price.service';
import {
  CreatePriceGroupDto,
  UpdatePriceGroupDto,
  PriceGroupPaginationDto,
  StatusDto,
} from './dto/create-price-group.dto';

@Injectable()
export class PriceGroupService {
  constructor(
    @InjectRepository(PriceGroup)
    private readonly priceGroupRepository: Repository<PriceGroup>,
    private readonly productPriceService: ProductPriceService,
  ) {}

  async create(dto: CreatePriceGroupDto) {
    const existing = await this.priceGroupRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Price group with this name already exists');
    }

    const priceGroup = this.priceGroupRepository.create(dto);
    const savedPriceGroup = await this.priceGroupRepository.save(priceGroup);

    if (dto.productPrices?.length > 0) {
      await this.productPriceService.bulkCreate({
        priceGroupId: savedPriceGroup.id,
        products: dto.productPrices,
      });
    }

    return this.findOne(savedPriceGroup.id);
  }

  async findAll(dto: PriceGroupPaginationDto) {
    const query = this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .select([
        'priceGroup.id',
        'priceGroup.name',
        'priceGroup.status',
        'priceGroup.createdAt',
      ]);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('priceGroup.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    if (dto.status) {
      query.andWhere('priceGroup.status = :status', { status: dto.status });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('priceGroup.name', 'ASC')
      .getManyAndCount();

    return { result, total };
  }

  async findAllForAdmin(dto: PriceGroupPaginationDto) {
    const query = this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .leftJoinAndSelect('priceGroup.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.product', 'product')
      .select([
        'priceGroup.id',
        'priceGroup.name',
        'priceGroup.status',
        'priceGroup.createdAt',
        'priceGroup.updatedAt',
        'productPrices.id',
        'productPrices.price',
        'product.id',
        'product.name',
        'product.sku',
      ]);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('priceGroup.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    if (dto.status) {
      query.andWhere('priceGroup.status = :status', { status: dto.status });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('priceGroup.name', 'ASC')
      .getManyAndCount();

    return { result, total };
  }

  async findAllForStaff(dto: PriceGroupPaginationDto) {
    const query = this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .select(['priceGroup.id', 'priceGroup.name', 'priceGroup.status'])
      .where('priceGroup.status = :status', { status: 'ACTIVE' });

    if (dto.keyword) {
      query.andWhere('priceGroup.name LIKE :keyword', {
        keyword: `%${dto.keyword}%`,
      });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('priceGroup.name', 'ASC')
      .getManyAndCount();

    return { result, total };
  }

  async findOne(id: string) {
    const result = await this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .leftJoinAndSelect('priceGroup.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.product', 'product')
      .where('priceGroup.id = :id', { id })
      .getOne();

    if (!result) {
      throw new NotFoundException('Price group not found');
    }

    return result;
  }

  async findOneForAdmin(id: string) {
    const result = await this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .leftJoinAndSelect('priceGroup.productPrices', 'productPrices')
      .leftJoinAndSelect('productPrices.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .select([
        'priceGroup.id',
        'priceGroup.name',
        'priceGroup.status',
        'priceGroup.createdAt',
        'priceGroup.updatedAt',
        'productPrices.id',
        'productPrices.price',
        'product.id',
        'product.name',
        'product.sku',
        'product.sellingPrice',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',
      ])
      .where('priceGroup.id = :id', { id })
      .getOne();

    if (!result) {
      throw new NotFoundException('Price group not found');
    }

    return result;
  }

  async findOneForStaff(id: string) {
    const result = await this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .select(['priceGroup.id', 'priceGroup.name', 'priceGroup.status'])
      .where('priceGroup.id = :id AND priceGroup.status = :status', {
        id,
        status: 'ACTIVE',
      })
      .getOne();

    if (!result) {
      throw new NotFoundException('Price group not found');
    }

    return result;
  }

  async update(id: string, dto: UpdatePriceGroupDto) {
    const priceGroup = await this.priceGroupRepository.findOne({
      where: { id },
    });

    if (!priceGroup) {
      throw new NotFoundException('Price group not found');
    }

    if (dto.name && dto.name !== priceGroup.name) {
      const existing = await this.priceGroupRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          'Price group with this name already exists',
        );
      }
    }

    Object.assign(priceGroup, dto);
    await this.priceGroupRepository.save(priceGroup);

    if (dto.productPrices) {
      await this.productPriceService.bulkCreate({
        priceGroupId: id,
        products: dto.productPrices,
      });
    }

    return this.findOne(id);
  }

  async status(id: string, dto: StatusDto) {
    const result = await this.priceGroupRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Price Group  not found!');
    const obj = Object.assign(result, dto);
    return this.priceGroupRepository.save(obj);
  }
  async delete(id: string) {
    await this.productPriceService.deleteByPriceGroup(id);
    return this.priceGroupRepository.delete(id);
  }

  async getActivePriceGroups() {
    const [result, total] = await this.priceGroupRepository
      .createQueryBuilder('priceGroup')
      .select(['priceGroup.id', 'priceGroup.name'])
      .where('priceGroup.status = :status', { status: 'ACTIVE' })
      .orderBy('priceGroup.name', 'ASC')
      .getManyAndCount();

    return { result, total };
  }

  async getProductPrice(productId: string, priceGroupId: string) {
    return this.productPriceService.findByProductAndPriceGroup(
      productId,
      priceGroupId,
    );
  }
}
