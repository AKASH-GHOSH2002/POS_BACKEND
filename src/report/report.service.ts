import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from '../bill/entities/bill.entity';
import { BillStatus } from 'src/enum';
import { ReportDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) { }

  async getSalesReportByDateRange(dto: ReportDto & { status?: string }) {
    const query = this.billRepository
      .createQueryBuilder('bill')
      .leftJoin('bill.customer', 'customer')
      .select([
        'bill.id',
        'bill.billNumber',
        'bill.total',
        'bill.status',
        'bill.paidAmount',
        'bill.dueAmount',
        'bill.createdAt',
        'customer.name',
        'customer.phone'
      ])
      .where('bill.createdAt BETWEEN :start AND :end', { start: new Date(dto.startDate), end: new Date(dto.endDate) });

    if (dto.status) {
      query.andWhere('bill.status = :status', { status: dto.status });
    } else {
      query.andWhere('bill.status IN (:...statuses)', { statuses: [BillStatus.PAID, BillStatus.DUE] });
    }

    if (dto.storeId) {
      query.andWhere('bill.storeId = :storeId', { storeId: dto.storeId });
    }

    const [result, total] = await query.orderBy('bill.createdAt', 'DESC').getManyAndCount();
    const summary = this.calculateSummary(result);
    return { result, total, summary };
  }

  async getDailySalesReport(date: string, storeId?: string, status?: string) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    const query = this.billRepository
      .createQueryBuilder('bill')
      .leftJoin('bill.customer', 'customer')
      .select([
        'bill.id',
        'bill.billNumber',
        'bill.total',
        'bill.status',
        'bill.paidAmount',
        'bill.dueAmount',
        'bill.createdAt',
        'customer.name',
        'customer.phone'
      ])
      .where('bill.createdAt >= :start', { start: startOfDay })
      .andWhere('bill.createdAt <= :end', { end: endOfDay });

    if (status) {
      query.andWhere('bill.status = :status', { status });
    } else {
      query.andWhere('bill.status IN (:...statuses)', { statuses: [BillStatus.PAID, BillStatus.DUE] });
    }

    if (storeId) {
      query.andWhere('bill.storeId = :storeId', { storeId });
    }

    const [result, total] = await query
      .orderBy('bill.createdAt', 'DESC')
      .getManyAndCount();
    const summary = this.calculateSummary(result);
    return { result, total, summary };
  }

  async getSevenDaysSalesReport(selectedDate: string, storeId?: string, status?: string) {
    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const query = this.billRepository
      .createQueryBuilder('bill')
      .leftJoin('bill.customer', 'customer')
      .select([
        'bill.id',
        'bill.billNumber',
        'bill.total',
        'bill.status',
        'bill.paidAmount',
        'bill.dueAmount',
        'bill.createdAt',
        'customer.name',
        'customer.phone'
      ])
      .where('bill.createdAt >= :start', { start: startDate })
      .andWhere('bill.createdAt <= :end', { end: endDate });

    if (status) {
      query.andWhere('bill.status = :status', { status });
    } else {
      query.andWhere('bill.status IN (:...statuses)', { statuses: [BillStatus.PAID, BillStatus.DUE] });
    }

    if (storeId) {
      query.andWhere('bill.storeId = :storeId', { storeId });
    }

    const [result, total] = await query.orderBy('bill.createdAt', 'DESC').getManyAndCount();
    const summary = this.calculateSummary(result);
    return { result, total, summary };
  }

  private calculateSummary(bills: any[]) {
    const totalSales = bills.reduce((sum, bill) => sum + Number(bill.total), 0);
    const totalPaid = bills.reduce((sum, bill) => sum + Number(bill.paidAmount || 0), 0);
    const totalDue = bills.reduce((sum, bill) => sum + Number(bill.dueAmount || 0), 0);

    return {
      totalSales,
      totalIncome: totalPaid,
      totalPaid,
      totalDue,
      billCount: bills.length
    };
  }
}