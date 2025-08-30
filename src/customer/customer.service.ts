import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  PaginationDto,
  UpdateCustomerDto,
  UpdateDueAndPurchaseDto,
  UpdateDueDto,
} from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}
  async payPreviousDue(customerId: string, amount: number) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found: ${customerId}`);
    }

    const prevDue = Number(customer.totalDue) || 0;
    let newDue = prevDue - amount;

    if (newDue < 0) {
      newDue = 0;
    }

    customer.totalDue = newDue;
    await this.customerRepository.save(customer);

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const { email, phone, storeId } = dto;

    const sameStore = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.storeId = :storeId', { storeId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('customer.email = :email', { email }).orWhere(
            'customer.phone = :phone',
            { phone },
          );
        }),
      )
      .getOne();

    if (sameStore) {
      throw new BadRequestException(
        'Email or phone already exists in this store.',
      );
    }

    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async updateDueAndPurchase(dto: UpdateDueAndPurchaseDto) {
    const { customerId, dueAmount, totalBillAmount } = dto;

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }

    customer.totalDue = Number(dueAmount);

    customer.totalPurchases =
      Number(customer.totalPurchases || 0) + Number(totalBillAmount);

    await this.customerRepository.save(customer);
  }

  async updateDue(dto: UpdateDueDto) {
    const { customerId, amount } = dto;

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }

    customer.totalDue = Number(customer.totalDue) + Number(amount);

    await this.customerRepository.save(customer);
  }

  async findCustomersByStoreId(storeId: string, dto: PaginationDto) {
    const keyword = dto.keyword || '';
    const query = this.customerRepository
      .createQueryBuilder('customer')
      .select([
        'customer.id',
        'customer.name',
        'customer.email',
        'customer.phone',
        'customer.address',
        'customer.totalDue',
      ])
      .where('customer.storeId = :storeId', { storeId });

    if (keyword) {
      query.andWhere(
        '(customer.name LIKE :kw OR customer.email LIKE :kw OR customer.phoneNumber LIKE :kw)',
        { kw: `%${keyword}%` },
      );
    }

    const [result, total] = await query
      .orderBy('customer.createdAt', 'DESC')
      .skip(dto.offset)
      .take(dto.limit)
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async findAll(dto: PaginationDto) {
    const query = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.store', 'store')
      .select([
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.email',
        'customer.status',
        'customer.address',
        'store.id',
        'store.name',
        'store.address',
        'store.phone',
        'store.email',
        'store.status',
        'store.storeCode',
      ]);

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('customer.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          })
            .orWhere('customer.phone LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('customer.email LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            });
        }),
      );
    }

    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('customer.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { total, result };
  }

  async findOne(id: string) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    try {
      await this.customerRepository.update(id, dto);
      const updatedCustomer = await this.findOne(id);
      return {
        message: 'Customer updated successfully',
        data: updatedCustomer,
      };
    } catch (error) {
      console.error('Update failed:', error);
      throw new InternalServerErrorException(
        'Something went wrong while updating',
      );
    }
  }

  async searchCustomers(query: string, storeId?: string) {
    const searchQuery = this.customerRepository
      .createQueryBuilder('customer')
      .select([
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.email',
        'customer.totalDue',
        'customer.totalPurchases',
        'customer.lastPaymentDate',
      ])
      .where(
        new Brackets((qb) => {
          qb.where('customer.name LIKE :query', { query: `%${query}%` })
            .orWhere('customer.phone LIKE :query', { query: `%${query}%` })
            .orWhere('customer.id = :query', { query });
        }),
      );

    if (storeId) {
      searchQuery.andWhere('customer.storeId = :storeId', { storeId });
    }

    const result = await searchQuery.limit(10).getMany();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return result;
  }

  async getCustomerDues(storeId: string) {
    const query = this.customerRepository
      .createQueryBuilder('customer')
      .select([
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.totalDue',
        'customer.totalPurchases',
        'customer.lastPaymentDate',
      ])
      .where('customer.totalDue > 0');

    if (storeId) {
      query.andWhere('customer.storeId = :storeId', { storeId });
    }

    const [result, total] = await query
      .orderBy('customer.totalDue', 'DESC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async getCustomerWithDues(id: string) {
    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.ledgerEntries', 'ledger')
      .leftJoinAndSelect('customer.bills', 'bills')
      .select([
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.email',
        'customer.totalDue',
        'customer.totalPurchases',
        'customer.lastPaymentDate',
        'ledger.id',
        'ledger.type',
        'ledger.debit',
        'ledger.credit',
        'ledger.balance',
        'ledger.note',
        'ledger.date',
        'bills.id',
        'bills.billNumber',
        'bills.total',
        'bills.paidAmount',
        'bills.dueAmount',
        'bills.status',
        'bills.createdAt',
      ])
      .where('customer.id = :id', { id })
      .orderBy('ledger.date', 'DESC')
      .addOrderBy('bills.createdAt', 'DESC')
      .getOne();

    if (!result) {
      throw new NotFoundException('Customer not found');
    }

    return result;
  }

  delete(id: string) {
    return this.customerRepository.delete(id);
  }
}
