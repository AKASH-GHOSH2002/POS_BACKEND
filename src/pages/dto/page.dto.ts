import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { PageType } from '../../enum';

export class PageDto {

  @IsOptional()
  @IsEnum(PageType)
  title: PageType;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(100000)
  desc: string;
}
