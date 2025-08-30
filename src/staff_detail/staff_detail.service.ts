import { Injectable, NotFoundException } from '@nestjs/common';

import {
  PaginationDto,
  UpdateStaffDetailDto,
} from './dto/update-staff_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { StaffDetail } from './entities/staff_detail.entity';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class StaffDetailService {
  constructor(
    @InjectRepository(StaffDetail)
    private readonly repo: Repository<StaffDetail>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async getProfile(id: string) {
    const result = await this.accountRepo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.staffDetail', 'staffDetail')
      .select([
        'account.id',
        'account.roles',
        'account.email',
        'account.phoneNumber',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.address',
      ])
      .where('staffDetail.accountId = :id', { id: id })
      .getOne();
    if (!result) {
      throw new NotFoundException('User not found!');
    }
    return result;
  }

  async findAll(dto: PaginationDto) {
    const keyword = dto.keyword || '';
    const [result, total] = await this.repo
      .createQueryBuilder('staffDetail')
      .leftJoinAndSelect('staffDetail.account', 'account')
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            'staffDetail.email LIKE :email OR staffDetail.name LIKE :name ',
            {
              email: '%' + keyword + '%',
              name: '%' + keyword + '%',
            },
          );
        }),
      )
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy({ 'staffDetail.name': 'ASC' })
      .getManyAndCount();
    return { result, total };
  }

  async update(id: string, dto: UpdateStaffDetailDto) {
    const result = await this.repo.findOne({ where: { accountId: id } });
    if (!result) {
      throw new NotFoundException('Staff not found!');
    }
    const obj = Object.assign(result, dto);
    return this.repo.save(obj);
  }

  async findOne(id: string) {
    const staffDetail = await this.repo.findOne({
      where: { id: id },
    });
    if (!staffDetail) {
      throw new NotFoundException('Staff detail not found!');
    }
    return staffDetail;
  }

  async uploadImage(image: string, result: StaffDetail) {
    const obj = Object.assign(result, {
      image: process.env.RN_CDN_LINK + image,
      imageName: image,
    });
    return await this.repo.save(obj);
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }
}
