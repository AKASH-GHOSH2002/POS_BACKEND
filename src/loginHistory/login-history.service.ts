import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { PaginationDto } from './dto/update-login-detail.dto';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectRepository(LoginHistory)
    private repo: Repository<LoginHistory>,
  ) {}

  async findAll(dto: PaginationDto) {
    const query = this.repo
      .createQueryBuilder('loginHistory')
      .leftJoin('loginHistory.account', 'account')
      .select([
        'loginHistory.id',
        'loginHistory.loginId',
        'loginHistory.duration',
        'loginHistory.ip',
        'loginHistory.type',
        'loginHistory.createdAt',
        'account.id',
        'account.email',
      ]);

    if (dto.fromDate && dto.toDate) {
      const fromDate = new Date(dto.fromDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(dto.toDate);
      toDate.setHours(23, 59, 59, 999);

      query.andWhere('loginHistory.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    if (dto.keyword) {
      query.andWhere(
        'account.email LIKE :keyword OR loginHistory.ip LIKE :keyword',
        { keyword: `%${dto.keyword}%` },
      );
    }

    const [result, total] = await query
      .orderBy('loginHistory.createdAt', 'DESC')
      .take(dto.limit ?? 10)
      .skip(dto.offset ?? 0)
      .getManyAndCount();

    return { result, total };
  }
}
