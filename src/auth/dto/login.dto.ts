import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../enum';


export class SendOtpEmailDto {
  @IsNotEmpty()
  @MinLength(2)
  email: string;
}


export class VerifyOtpDto {
  @IsOptional()
  @MinLength(0)
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  otp: string;
}
export class AdminSigninDto {
  @IsNotEmpty()
  loginId: string;

  @IsOptional()
  password: string
}
export class ForgotPassDto {
 @IsOptional()
  @MinLength(0)
  @MaxLength(50)
  email: string;

  @IsOptional()
  newPassword: string;

 
}
