import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Ip,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRole } from 'src/enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminSigninDto, ForgotPassDto, VerifyOtpDto, } from './dto/login.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Account } from 'src/account/entities/account.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  signin(@Body() dto: AdminSigninDto, @Ip() ip: string) {
    return this.authService.signIn(dto.loginId, dto.password,ip);
  }

  @Post('staff/login')
  @ApiOperation({ summary: 'Staff login' })
  @ApiResponse({ status: 200, description: 'Staff login successful' })
  staffLogin(@Body() dto: StaffLoginDto, @Ip() ip: string) {
    return this.authService.staffLogin(dto.email, dto.password, ip);
  }

  @Post('forgotPass')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  hrForgotPass(@Body() dto: ForgotPassDto) {
    return this.authService.forgotPass(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  hrVerifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Post('resetPass')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  hrResetPassword(@Body() dto: ForgotPassDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@CurrentUser() user: Account, @Ip() ip) {
    return this.authService.logout(user.id, ip);
  }

  // @Post('change-password')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiOperation({ summary: 'Change password for staff and admin' })
  // @ApiResponse({ status: 200, description: 'Password changed successfully' })
  // changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user) {
  //   return this.authService.changePassword(
  //     user.id,
  //     dto.oldPassword,
  //     dto.newPassword,
  //   );
  // }
}
