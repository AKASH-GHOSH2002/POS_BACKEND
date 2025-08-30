import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateModelDto,
  PaginationDto,
  StatusDto,
} from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { Brackets, Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultStatus } from 'src/enum';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {}
  async create(dto: CreateModelDto) {
    const result = await this.modelRepository.findOne({
      where: { name: dto.name },
    });
    if (result) throw new ConflictException('Model already exists');
    const obj = Object.create(dto);
    return this.modelRepository.save(obj);
  }

  async findAll(dto: PaginationDto) {
    const keyword = dto.keyword || '';
    const queryBuilder = this.modelRepository
      .createQueryBuilder('model')
      .select(['model.id', 'model.name', 'model.status'])
      .andWhere(
        new Brackets((qb) => {
          qb.where('model.name LIKE :name', { name: `%${keyword}%` });
        }),
      );

    if (dto.status) {
      queryBuilder.andWhere('model.status = :status', { status: dto.status });
    }

    const [result, count] = await queryBuilder
      .take(dto.limit)
      .skip(dto.offset)
      .getManyAndCount();
    return { result, count };
  }

  async findAllByUser(dto: PaginationDto) {
    const keyword = dto.keyword || '';
    const queryBuilder = this.modelRepository
      .createQueryBuilder('model')
      .leftJoin('model.products', 'product')
      .leftJoin('product.category', 'category')
      .select(['model.id', 'model.name', 'model.status'])
      .where('model.status = :status', { status: DefaultStatus.ACTIVE })
      .andWhere(
        new Brackets((qb) => {
          qb.where('model.name LIKE :name', { name: `%${keyword}%` });
        }),
      );

    const [result, count] = await queryBuilder
      .groupBy('model.id')
      .orderBy('model.name', 'ASC')
      .take(dto.limit)
      .skip(dto.offset)
      .getManyAndCount();

    return { result, count };
  }

  async findOne(id: string) {
    const result = await this.modelRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Model not found');
    return result;
  }

  async status(id: string, dto: StatusDto) {
    const result = await this.modelRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Model not found!');
    const obj = Object.assign(result, dto);
    return this.modelRepository.save(obj);
  }

  async update(id: string, dto: UpdateModelDto) {
    const result = await this.modelRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Model not found');
    const obj = Object.assign(result, dto);
    return this.modelRepository.save(obj);
  }

  async remove(id: string) {
    // Check if model exists
    const result = await this.modelRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException({
        success: false,
        message: 'Model not found',
      });
    }

    // Fetch model with products
    const modelWithProducts = await this.modelRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.products', 'product')
      .where('model.id = :id', { id })
      .getOne();

    // If model has products, prevent deletion
    if (modelWithProducts && modelWithProducts.products.length > 0) {
      throw new ConflictException({
        success: false,
        message:
          'This model has products linked. Please remove products before deleting.',
      });
    }

    // Delete model
    await this.modelRepository.delete(id);
    return {
      success: true,
      message: 'Model deleted successfully',
    };
  }
}
