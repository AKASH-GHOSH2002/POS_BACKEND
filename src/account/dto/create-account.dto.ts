import { IsOptional, IsString, IsInt, Min, IsNotEmpty, MinLength, MaxLength, IsEmail, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultStatus, UserRole } from 'src/enum';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  loginId: string;

  @IsOptional()
  @IsString()
  storeId: string;

  @IsOptional()
  @IsString()
  status: DefaultStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];
}
export class CreateAccountDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(14)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  password: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  address: string;

}

export class salesStaffDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(14)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  password: string;

  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  address: string;

@IsOptional()
  @IsEnum(UserRole)
  roles: UserRole;
}