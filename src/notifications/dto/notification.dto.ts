import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';
import { NotificationType } from '../../enum';
import { Type } from 'class-transformer';


export class NotificationDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  desc: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  deviceId?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}
