import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto, PaginationDto, salesStaffDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultStatus, UserRole } from 'src/enum';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private readonly repo: Repository<Account>,
    @InjectRepository(StaffDetail)
    private readonly staffRepo: Repository<StaffDetail>,
  ) {}

  async create(dto: CreateAccountDto, createdBy: string) {
    const user = await this.repo.findOne({
      where: { phoneNumber: dto.phoneNumber, roles: UserRole.STAFF_MANAGER },
    });
    if (user) throw new ConflictException('Login ID already exists!');

    const encryptedPassword = await bcrypt.hash(dto.password, 13);
    const account = await this.repo.save({
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: encryptedPassword,
      createdBy,
      roles: UserRole.STAFF_MANAGER,
    });

    await this.staffRepo.save({
      name: dto.name,
      address: dto.address,
      accountId: account.id,
     
    });

    return account;
  }

  async staffcreate(dto: salesStaffDto, createdBy: string) {
    const user = await this.repo.findOne({
      where: { phoneNumber: dto.phoneNumber, roles: UserRole.SALES_STAFF },
    });
    if (user) {
      throw new ConflictException('Login id already exists!');
    }
    const encryptedPassword = await bcrypt.hash(dto.password, 13);
    const obj = Object.assign({
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: encryptedPassword,
      createdBy,
      roles: UserRole.SALES_STAFF,
    });
    const payload = await this.repo.save(obj);
    const object = Object.assign({
      name: dto.name,
      address: dto.address,
      accountId: payload.id,
      storeId: dto.storeId,
      
    });
    await this.staffRepo.save(object);
    return payload;
  }
  async findAll(dto: PaginationDto) {
    const query = this.repo
      .createQueryBuilder('account')
      .leftJoin('account.staffDetail', 'staffDetail')
      .select([
        'account.id',
        'account.email',
        'account.phoneNumber',
        'account.roles',
        'account.status',
        'account.createdAt',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.address',
        'staffDetail.storeId',
        
      ])
      .where('account.roles IN (:...roles)', {
        roles: [UserRole.SALES_STAFF, UserRole.STAFF_MANAGER],
      });

    if (dto.keyword) {
      query.andWhere(
        '(account.name LIKE :keyword OR account.email LIKE :keyword OR account.phoneNumber LIKE :keyword)',
        { keyword: `%${dto.keyword}%` },
      );
    }

    if (dto.status) {
      query.andWhere('account.status = :status', { status: dto.status });
    }

    if (dto.storeId) {
      query.andWhere('staffDetail.storeId = :storeId', {
        storeId: dto.storeId,
      });
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('account.createdAt', 'DESC')
      .getManyAndCount();

    return { result, total };
  }

  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Account ID is required');
    }
    const account = await this.repo
      .createQueryBuilder('account')
      .leftJoin('account.staffDetail', 'staffDetail')
      .select([
        'account.id',
        'account.email',
        'account.phoneNumber',
        'account.roles',
        'account.createdAt',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.email',
        'staffDetail.address',
      ])
      .where('account.id = :id', { id })
      .andWhere('account.roles IN (:...roles)', {
        roles: [UserRole.SALES_STAFF, UserRole.STAFF_MANAGER],
      })
      .getOne();

    if (account && account.roles === UserRole.SALES_STAFF) {
      const staffWithStore = await this.staffRepo.findOne({
        where: { accountId: account.id },
        select: ['storeId'],
      });
      account['staffDetail']['storeId'] = staffWithStore?.storeId || null;
    }

    return account;
  }

  async getstaffProfile(id: string) {
    const result = await this.repo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.staffDetail', 'staffDetail')
      .select([
        'account.id',
        'account.email',
        'account.phoneNumber',
        'account.roles',
        'account.status',
        'account.createdAt',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.address',
        'staffDetail.storeId',
      ])
      .where('account.id = :id', { id })
      .getOne();

    if (!result) {
      throw new NotFoundException('Profile not found');
    }

    return result;
  }

  async updateSatffStatus(id: string, status: DefaultStatus) {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const obj = Object.assign(account, status);
    const result = await this.repo.save(account);

    return result;
  }



  async deletestaffAccount(id: string, currentUser: Account) {
    if (currentUser.roles !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can delete accounts');
    }

    const account = await this.repo.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const staffDetail = await this.staffRepo.findOne({
      where: { accountId: id },
    });
   
    await this.repo.remove(account);
    return { message: 'Account  related  data deleted successfully' };
  }


}
