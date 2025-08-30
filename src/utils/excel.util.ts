import * as XLSX from 'xlsx';

export class ExcelUtil {
  static generateExcel(data: any[], sheetName: string = 'Sheet1'): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}