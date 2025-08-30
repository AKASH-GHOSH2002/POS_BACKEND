import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createBackup(res: Response) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', filename);

    if (!fs.existsSync(path.dirname(backupPath))) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }

    const tables = await this.dataSource.query('SHOW TABLES');
    let sqlDump = '';

    for (const table of tables) {
      const tableName = Object.values(table)[0] as string;
      
      const createTable = await this.dataSource.query(`SHOW CREATE TABLE ${tableName}`);
      sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlDump += `${createTable[0]['Create Table']};\n\n`;

      const rows = await this.dataSource.query(`SELECT * FROM ${tableName}`);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const values = rows.map(row => 
          `(${columns.map(col => 
            row[col] === null ? 'NULL' : `'${String(row[col]).replace(/'/g, "\\'")}'`
          ).join(', ')})`
        ).join(',\n');
        
        sqlDump += `INSERT INTO \`${tableName}\` (${columns.map(col => `\`${col}\``).join(', ')}) VALUES\n${values};\n\n`;
      }
    }

    fs.writeFileSync(backupPath, sqlDump);

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.sendFile(backupPath);
  }

  async restoreBackup(file: Express.Multer.File) {
    const sqlContent = fs.readFileSync(file.path, 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await this.dataSource.query(statement);
      }
    }

    fs.unlinkSync(file.path);
    return { message: 'Database restored successfully' };
  }
}