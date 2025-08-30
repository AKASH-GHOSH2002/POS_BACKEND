import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { BrandPaginationDto, CreateBrandDto, DefaultStatusDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto) {
    const existing = await this.brandRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Brand with this name already exists.');
    }

    const brand = Object.create(dto);
    return this.brandRepository.save(brand);
  }

  async findAll(dto: BrandPaginationDto) {
    const query = this.brandRepository
      .createQueryBuilder('brand')
      .select(['brand.id', 'brand.name', 'brand.status', 'brand.description']);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('brand.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          }).orWhere('brand.description LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    if (dto.status) {
      query.andWhere('brand.status = :status', { status: dto.status });
    }
    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('brand.name', 'ASC')
      .getManyAndCount();

    return { total, result };
  }

  async findOne(id: string) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand not found`);
    }
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOneBy({ id });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (dto.name && dto.name !== brand.name) {
      const existing = await this.brandRepository.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Brand with this name already exists.');
      }
    }

    Object.assign(brand, dto);
    return this.brandRepository.save(brand);
  }

  async updateBrandStatus(id: string, dto: DefaultStatusDto) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Brand not found!');
    }
    if (brand.status === dto.status) {
      throw new ConflictException('Brand status is already set to this value.');
    }
    const obj = Object.assign(brand, dto);
    return await this.brandRepository.save(obj);
  }

  async remove(id: string) {
    const result = await this.brandRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('Brand not found');
    }
    const products = await this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.products', 'product')
      .where('brand.id = :id', { id })
      .getOne();
    if (products.products.length > 0) {
      throw new ConflictException('Brand has products can not be deleted');
    }
    await this.brandRepository.delete(id);
    return { message: 'Brand deleted successfully' };
  }
  
}