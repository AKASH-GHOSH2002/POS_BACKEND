import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExcelUtil } from '../utils/excel.util';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseReportDto } from './dto/expense-report.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) { }

  async create(dto: CreateExpenseDto) {
    const expense = this.expenseRepository.create({
      ...dto,
      expenseDate: new Date(dto.expenseDate),
    });
    return this.expenseRepository.save(expense);
  }

  async findAll(storeId?: string) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.store', 'store')
      .leftJoin('expense.account', 'account')
      .leftJoin('account.staffDetail', 'staffDetail')
      .select([
        'expense.id',
        'expense.title',
        'expense.description',
        'expense.amount',
        'expense.expenseDate',
        'expense.createdAt',
        'store.id',
        'store.name',
        'account.id',
        'account.email',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.address'
      ])
      .orderBy('expense.expenseDate', 'DESC');

    if (storeId) {
      query.andWhere('expense.storeId = :storeId', { storeId });
    }

    const [result, total] = await query.getManyAndCount();
    return { result, total };
  }

  async findOne(id: string) {
    const expense = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.store', 'store')
      .leftJoin('expense.account', 'account')
      .leftJoin('account.staffDetail', 'staffDetail')
      .select([
        'expense.id',
        'expense.title',
        'expense.description',
        'expense.amount',
        'expense.expenseDate',
        'expense.createdAt',
        'store.id',
        'store.name',
        'account.id',
        'account.email',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.address'
      ])
      .where('expense.id = :id', { id })
      .getOne();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.expenseRepository.update(id, {
      ...dto,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
    });
    return this.findOne(id);
  }

  async delete(id: string) {
    return this.expenseRepository.delete(id);
  }

  async getExpenseReport(dto: ExpenseReportDto, accountId?: string) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.store', 'store')
      .leftJoin('expense.account', 'account')
      .leftJoin('account.staffDetail', 'staffDetail')
      .select([
        'expense.id',
        'expense.title',
        'expense.description',
        'expense.amount',
        'expense.expenseDate',
        'expense.createdAt',
        'store.id',
        'store.name',
        'account.id',
        'account.email',
        'staffDetail.id',
        'staffDetail.name',
        'staffDetail.address'
      ])
      .where('expense.expenseDate BETWEEN :start AND :end', { start, end });

    if (dto.storeId) {
      query.andWhere('expense.storeId = :storeId', { storeId: dto.storeId });
    }

    if (accountId) {
      query.andWhere('expense.accountId = :accountId', { accountId });
    }

    const [result, total] = await query.getManyAndCount();

    return { result, total };
  }

  async exportToExcel(storeId?: string) {
    const { result } = await this.findAll(storeId);
    
    const excelData = result.map(expense => ({
      'Title': expense.title,
      'Description': expense.description,
      'Amount': expense.amount,
      'Expense Date': expense.expenseDate,
      'Store': expense.store?.name || 'N/A',
      'Created By': expense.account?.staffDetail?.[0]?.name || expense.account?.email || 'N/A',
      'Created At': expense.createdAt
    }));

    return ExcelUtil.generateExcel(excelData, 'Expenses Report');
  }

}
