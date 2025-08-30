import { Controller, Get, Post, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackupService } from './backup.service';
import { Response } from 'express';
import { diskStorage } from 'multer';

@ApiTags('Backup')
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) { }

  @Get('create')
  @ApiOperation({ summary: 'Create database backup' })
  @ApiResponse({ status: 200, description: 'Backup created successfully' })
  createBackup(@Res() res: Response) {
    return this.backupService.createBackup(res);
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './temp',
      filename: (req, file, cb) => cb(null, `restore-${Date.now()}.sql`)
    })
  }))
  @ApiOperation({ summary: 'Restore database from backup' })
  @ApiResponse({ status: 200, description: 'Database restored successfully' })
  restoreBackup(@UploadedFile() file: Express.Multer.File) {
    return this.backupService.restoreBackup(file);
  }
}