import { Response } from 'express';
import { ExcelUtil } from './excel.util';

export class ReportUtil {
  static formatBillsForExport(bills: any[]): any[] {
    return bills.map(bill => ({
      'Bill Number': bill.billNumber,
      'Customer Name': bill.customer?.name || 'N/A',
      'Total Amount': bill.total,
      'Status': bill.status,
      'Date': new Date(bill.createdAt).toLocaleDateString(),
      'Store': bill.store?.name || 'N/A'
    }));
  }

  static formatUnpaidBillsForExport(bills: any[]): any[] {
    return bills.map(bill => ({
      'Bill Number': bill.billNumber,
      'Customer Name': bill.customer?.name || 'N/A',
      'Customer Phone': bill.customer?.phone || 'N/A',
      'Total Amount': bill.total,
      'Due Amount': bill.dueAmount,
      'Date': new Date(bill.createdAt).toLocaleDateString(),
      'Store': bill.store?.name || 'N/A'
    }));
  }

  static formatCustomerHistoryForExport(bills: any[]): any[] {
    return bills.map(bill => ({
      'Bill Number': bill.billNumber,
      'Total Amount': bill.total,
      'Items': bill.items?.length || 0,
      'Date': new Date(bill.createdAt).toLocaleDateString()
    }));
  }

  static async exportToExcel(data: any[], filename: string, res: Response): Promise<void> {
    const buffer = ExcelUtil.generateExcel(data, 'Report');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    res.send(buffer);
  }

  static calculateTotals(bills: any[]): { totalAmount: number; totalDue: number; totalBills: number } {
    const totalAmount = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const totalDue = bills.reduce((sum, bill) => sum + (bill.dueAmount || 0), 0);
    const totalBills = bills.length;

    return { totalAmount, totalDue, totalBills };
  }
}