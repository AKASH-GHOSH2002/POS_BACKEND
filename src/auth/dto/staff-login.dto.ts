import { IsNotEmpty, IsString } from 'class-validator';

export class StaffLoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}