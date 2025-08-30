import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { StateDto } from './dto/state.dto';
import { State } from './entities/state.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State) private readonly repo: Repository<State>,
  ) {}

  async create(dto: StateDto) {
    const state = await this.repo.findOne({ where: { name: dto.name } });
    if (state) {
      throw new ConflictException('State already exists!');
    }
    const obj = Object.create(dto);
    return this.repo.save(obj);
  }

async findAll(limit: number, offset: number, keyword: string, status: boolean) {
  const query = this.repo.createQueryBuilder('state');

  if (typeof status === 'boolean') {
    query.andWhere('state.status = :status', { status });
  }

  if (keyword) {
    query.andWhere('state.name LIKE :pname', { pname: `%${keyword}%` });
    query.orderBy(
      `CASE WHEN state.name LIKE :startsWith THEN 0 ELSE 1 END, state.name`,
      'ASC',
    );
    query.setParameter('startsWith', `${keyword}%`);
  } else {
    query.orderBy('state.name', 'ASC');
  }

  const [result, total] = await query
    .take(limit)
    .skip(offset)
    .getManyAndCount();

  return { result, total };
}


  async find(limit: number, offset: number, keyword: string) {
    const [result, total] = await this.repo
      .createQueryBuilder('state')
      .where('state.status = :status', { status: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('state.name LIKE :pname', {
            pname: '%' + keyword + '%',
          });
        }),
      )
      .orderBy(
        `CASE WHEN state.name LIKE '${keyword}%' THEN 0 ELSE 1 END, state.name`,
        'ASC',
      )
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    return { result, total };
  }

  async update(id: number, dto: StateDto) {
    try {
      const state = await this.repo.findOne({ where: { id } });
      if (!state) {
        throw new NotFoundException('State not found!');
      }
      const obj = Object.assign(state, { name: dto.name });
      return this.repo.save(obj);
    } catch (error) {
      throw new NotAcceptableException(
        'Either catgeory exists or invalid name!',
      );
    }
  }
}
