import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;
}
