import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitDto } from './create-unit.dto';
import { DefaultStatus } from 'src/enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUnitDto extends PartialType(CreateUnitDto) { }

export class UpdateUnitStatusDto {
    @IsNotEmpty()
    @IsEnum(DefaultStatus)
    status: DefaultStatus;
}