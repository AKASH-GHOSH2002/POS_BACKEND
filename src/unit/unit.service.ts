import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto, UnitPaginationDto } from './dto/create-unit.dto';
import { UpdateUnitDto, UpdateUnitStatusDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(dto: CreateUnitDto) {
    const existing = await this.unitRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new Error('Unit with this name already exists.');
    }

    const unit = this.unitRepository.create(dto);
    return this.unitRepository.save(unit);
  }

  async findAll(dto: UnitPaginationDto) {
    const query = this.unitRepository
      .createQueryBuilder('unit')
      .select(['unit.id', 'unit.status', 'unit.name', 'unit.shortName']);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('unit.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          }).orWhere('unit.shortName LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    if (dto.status) {
      query.andWhere('unit.status = :status', { status: dto.status });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('unit.name', 'ASC')
      .getManyAndCount();

    return { total, result };
  }

  async findOne(id: string) {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit not found`);
    }
    return unit;
  }

  async update(id: string, data: UpdateUnitDto) {
    await this.unitRepository.update(id, data);
    return this.unitRepository.findOneBy({ id });
  }
  async updateStatus(id: string, dto: UpdateUnitStatusDto) {
    const unit = await this.unitRepository.findOne({ where: { id: id } });
    if (!unit) {
      throw new NotFoundException('Unit not found!');
    }
    if (unit.status === dto.status) {
      throw new Error('Unit status is already set to this value.');
    }
    const obj = Object.assign(unit, dto);
    return this.unitRepository.save(obj);
  }

  async delete(id: string) {
    const unit = await this.unitRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!unit) {
      throw new NotFoundException({
        success: false,
        message: 'Unit not found',
      });
    }

    if (unit.products && unit.products.length > 0) {
      throw new ConflictException({
        success: false,
        message:
          'This unit has products linked. Please remove products before deleting.',
      });
    }

    await this.unitRepository.delete(id);
    return {
      success: true,
      message: 'Unit deleted successfully',
    };
  }
}
