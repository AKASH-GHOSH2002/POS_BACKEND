import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from '../bill/entities/bill.entity';
import { BillItem } from '../bill-item/entities/bill-item.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { BillStatus } from 'src/enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(BillItem)
    private billItemRepository: Repository<BillItem>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) { }

async getDashboardMetrics(storeId?: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  //bills (PAID + DUE)
  const billsQuery = this.billRepository
    .createQueryBuilder('bill')
    .select(['bill.id', 'bill.total', 'bill.paidAmount', 'bill.dueAmount', 'bill.status'])
    .where('bill.status IN (:...statuses)', { statuses: [BillStatus.PAID, BillStatus.DUE] })
    .andWhere('bill.createdAt >= :start', { start: startOfMonth })
    .andWhere('bill.createdAt <= :end', { end: endOfMonth });

  if (storeId) {
    billsQuery.andWhere('bill.storeId = :storeId', { storeId });
  }

  const bills = await billsQuery.getMany();

  const totalSales = bills.length;
  const totalSellAmount = bills.reduce((sum, bill) => sum + Number(bill.total), 0);
  const totalPaid = bills.reduce((sum, bill) => sum + Number(bill.paidAmount), 0);
  const totalDue = bills.reduce((sum, bill) => sum + Number(bill.dueAmount), 0);

  // Bill items PAID + DUE
  const itemsQuery = this.billItemRepository
    .createQueryBuilder('billItem')
    .leftJoin('billItem.bill', 'bill')
    .leftJoin('billItem.product', 'product')
    .select([
      'billItem.quantity', 
      'billItem.unitPrice', 
      'product.purchasePrice'
    ])
    .where('bill.status IN (:...statuses)', { statuses: [BillStatus.PAID, BillStatus.DUE] })
    .andWhere('bill.createdAt >= :start', { start: startOfMonth })
    .andWhere('bill.createdAt <= :end', { end: endOfMonth });

  if (storeId) {
    itemsQuery.andWhere('bill.storeId = :storeId', { storeId });
  }

  const items = await itemsQuery.getMany();

  const totalCost = items.reduce((sum, item) => {
    const cost = Number(item.product?.purchasePrice) || Number(item.unitPrice) * 0.7;
    return sum + (Number(item.quantity) * cost);
  }, 0);

  //expenses
  const expensesQuery = this.expenseRepository
    .createQueryBuilder('expense')
    .select(['expense.amount'])
    .where('expense.expenseDate >= :start', { start: startOfMonth })
    .andWhere('expense.expenseDate <= :end', { end: endOfMonth });

  if (storeId) {
    expensesQuery.andWhere('expense.storeId = :storeId', { storeId });
  }

  const expenses = await expensesQuery.getMany();
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Financial calculations
  const grossProfit = totalSellAmount - totalCost;
  const estimatedIncome = grossProfit - totalExpenses; // Based on total sales (paid + due)
  
  // Actual income calculations (cash-based - real business logic)
  const actualIncome = totalPaid - totalCost - totalExpenses; // Cash received minus full costs incurred

  const monthlyData = await this.getMonthlyData(storeId);

  return { 
    totalSales, 
    totalSellAmount, 
    totalPaid, 
    totalDue, 
    totalCost,
    totalExpenses,
    grossProfit, 
    estimatedIncome,
    actualIncome,   
    monthlyData 
  };
}



private async getMonthlyData(storeId?: string) {
  const billsQuery = this.billRepository
    .createQueryBuilder('bill')
    .select(['bill.paidAmount', 'bill.createdAt'])
    .where('bill.status IN (:...statuses)', { statuses: [BillStatus.PAID, BillStatus.DUE] });

  if (storeId) {
    billsQuery.andWhere('bill.storeId = :storeId', { storeId });
  }

  const bills = await billsQuery.getMany();

  const expensesQuery = this.expenseRepository
    .createQueryBuilder('expense')
    .select(['expense.amount', 'expense.expenseDate']);

  if (storeId) {
    expensesQuery.andWhere('expense.storeId = :storeId', { storeId });
  }

  const expenses = await expensesQuery.getMany();

  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthlyBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate.getFullYear() === year && (billDate.getMonth() + 1) === month;
    });

    const income = monthlyBills.reduce((sum, bill) => sum + Number(bill.paidAmount), 0);

    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.expenseDate);
      return expDate.getFullYear() === year && (expDate.getMonth() + 1) === month;
    });

    const expense = monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    months.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      income,
      expense
    });
  }

  return months;
}

  async getAllStoresDashboard() {
    return this.getDashboardMetrics();
  }

  async getStoreDashboard(storeId: string) {
    return this.getDashboardMetrics(storeId);
  }
}
