import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, DefaultStatusDto, PaginationDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists.');
    }

    const category = Object.create(dto);
    return this.categoryRepository.save(category);
  }

  async findAll(dto: PaginationDto) {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .select([
        'category.id',
        'category.name',
        'category.status',
        'category.description',
        'category.hasType',
        'category.hasSize',
        'category.hasColor',
        'category.hasCapacity',
      ]);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('category.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          }).orWhere('category.description LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }
    if (dto.status) {
      query.andWhere('category.status = :status', { status: dto.status });
    }
    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('category.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { total, result };
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists.');
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }
  async updateCategoryStatus(id: string, dto: DefaultStatusDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found!');
    }
    if (category.status === dto.status) {
      throw new ConflictException(
        'Category status is already set to this value.',
      );
    }
    const obj = Object.assign(category, dto);
    return await this.categoryRepository.save(obj);
  }

  async delete(id: string) {
    // Check if category exists
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'], // 👈 if Category has products relation
    });

    if (!category) {
      throw new NotFoundException({
        success: false,
        message: 'Category not found',
      });
    }

    // If category has products, prevent deletion
    if (category.products && category.products.length > 0) {
      throw new ConflictException({
        success: false,
        message:
          'This category has products linked. Please remove products before deleting.',
      });
    }

  
    await this.categoryRepository.delete(id);
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}