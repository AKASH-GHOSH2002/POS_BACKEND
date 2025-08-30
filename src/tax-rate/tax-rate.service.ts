import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxRateDto, PaginationDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaxRate } from './entities/tax-rate.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class TaxRateService {
  constructor(
    @InjectRepository(TaxRate)
    private readonly taxRateRepo: Repository<TaxRate>,
  ) {}

  async create(dto: CreateTaxRateDto) {
    const existing = await this.taxRateRepo.findOne({
      where: { name: dto.name, percentage: dto.percentage },
    });

    if (existing) {
      throw new ConflictException(
        'Tax rate with same title and rate already exists.',
      );
    }

    const taxRate = this.taxRateRepo.create(dto);
    return this.taxRateRepo.save(taxRate);
  }

  async findAll(dto: PaginationDto) {
    const query = this.taxRateRepo
      .createQueryBuilder('taxRate')
      .select(['taxRate.id', 'taxRate.name', 'taxRate.percentage']);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('taxRate.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          }).orWhere('CAST(taxRate.percentage AS CHAR) LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          });
        }),
      );
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('taxRate.name', 'ASC')
      .getManyAndCount();

    return { total, result };
  }

  async update(id: string, data: UpdateTaxRateDto) {
    const existing = await this.taxRateRepo.findOne({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Tax rate not found');
    }

    Object.assign(existing, data);
    return this.taxRateRepo.save(existing);
  }
 async delete(id: string) {
  const existing = await this.taxRateRepo.findOne({ where: { id } });

  if (!existing) {
    throw new NotFoundException('Tax rate not found');
  }

  await this.taxRateRepo.remove(existing);
  return { message: 'Tax rate deleted successfully' };
}

}

