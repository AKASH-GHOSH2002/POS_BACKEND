export class BillNumberUtil {
  static generateBillNumber(branchCode: string, date: Date, serial: number): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const serialStr = String(serial).padStart(6, '0');
    return `INV/${branchCode}/${dateStr}/${serialStr}`;
  }
}

