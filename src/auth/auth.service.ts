import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { Account } from 'src/account/entities/account.entity';
import APIFeatures from 'src/utils/apiFeatures.utils';
import { Repository } from 'typeorm';
import { DefaultStatus, LogType, UserRole } from '../enum';
import { Roles } from './decorators/roles.decorator';
import { stat } from 'fs';
import { log } from 'console';
import { ForgotPassDto } from './dto/login.dto';
import { UserPermission } from 'src/user-permissions/entities/user-permission.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { LoginHistoryService } from 'src/loginHistory/login-history.service';
import { LoginHistory } from 'src/loginHistory/entities/login-history.entity';



@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,

    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(UserPermission)
    private readonly upRepo: Repository<UserPermission>,
    @InjectRepository(LoginHistory)
    private readonly loginRepo: Repository<LoginHistory>,
    @InjectRepository(StaffDetail)
    private readonly staffDetailRepo: Repository<StaffDetail>,
  ) {}

  async signIn(loginId: string, password: string, ip:string) {
    const user = await this.getUserDetails(loginId);
    if (!user) {
      throw new UnauthorizedException('Login ID not found');
    }

    if (![UserRole.ADMIN, UserRole.STAFF_MANAGER].includes(user.roles)) {
      throw new UnauthorizedException('Access denied');
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      throw new UnauthorizedException('Incorrect password');
    }
    const obj = {
      loginId: user.email,
      ip: ip,
      type: LogType.LOGIN,
      accountId: user.id,
    };
    await this.loginRepo.save(obj);
    const token = await APIFeatures.assignJwtToken(user.id, this.jwtService);
    return {
      token,
      roles: user.roles,
    };
  }

  async staffLogin(email: string, password: string, ip: string) {
    const account = await this.repo
      .createQueryBuilder('account')
      .where('account.email = :email AND account.roles = :roles', {
        email,
        roles: UserRole.SALES_STAFF,
      })
      .getOne();

    if (!account) {
      throw new UnauthorizedException('Login ID not found');
    }

    const comparePassword = await bcrypt.compare(password, account.password);
    if (!comparePassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    const staffDetail = await this.getStaffDetailByAccountId(account.id);
    if (!staffDetail || !staffDetail.store) {
      throw new UnauthorizedException('Staff not assigned to any store');
    }

   
    const obj = {
      loginId: account.email,
      ip: ip,
      type: LogType.LOGIN,
      accountId: account.id,
    };
    await this.loginRepo.save(obj);

    const token = await APIFeatures.assignJwtToken(account.id, this.jwtService);
    return {
      token,
      roles: account.roles,
      storeId: staffDetail.store.id,
      storeName: staffDetail.store.name,
    };
  }

  async forgotPass(dto: ForgotPassDto) {
    const user = await this.repo
      .createQueryBuilder('account')
      .where(
        'account.email = :email AND account.roles = :roles AND account.status = :status',
        {
          email: dto.email,
          roles: UserRole.ADMIN,
          status: DefaultStatus.ACTIVE,
        },
      )
      .getOne();
    if (!user) {
      throw new NotFoundException(
        'Email does not exist. Please register first!',
      );
    }
    const otp = '7832';
    // const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await this.cacheManager.set(dto.email, otp, 15 * 60 * 1000);
    // await this.nodeMailerService.sendOtpInEmail(dto.email, otp);

    return { message: 'OTP sent to your email address' };
  }

  async verifyOtp(email: string, otp: string) {
    const storedOtp = await this.cacheManager.get<string>(email);
    if (storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    return { message: 'OTP Macthed.' };
  }

  async resetPassword(dto: ForgotPassDto) {
    const user = await this.repo
      .createQueryBuilder('account')
      .where(
        'account.email = :email AND account.roles = :roles AND account.status = :status',
        {
          email: dto.email,
          roles: UserRole.ADMIN,
          status: DefaultStatus.ACTIVE,
        },
      )
      .getOne();
    if (!user) {
      throw new NotFoundException(
        'Email does not exist. Please register first!',
      );
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;

    await this.repo.save(user);
    await this.cacheManager.del(dto.email);

    return { message: 'Password reset successfully' };
  }

  async validate(payload) {
    const user = await this.getUserDetails(payload.id);

    if (user.roles === UserRole.SALES_STAFF) {
      const staffDetail = await this.getStaffDetailByAccountId(user.id);
      if (staffDetail && staffDetail.store) {
        user.storeId = staffDetail.store.id;
        user.isStaff = true;
      }
    }

    return user;
  }

  private getUserDetails = async (
    id: string,
    role?: UserRole,
  ): Promise<any> => {
    // let result = await this.cacheManager.get('userDetail' + id);
    // if (!result) {
    const query = this.repo
      .createQueryBuilder('account')
      //.leftJoinAndSelect('account.userDetail', 'userDetail')
      .select([
        'account.id',
        'account.password',
        'account.email',
        'account.roles',
        'account.status',
        'account.createdBy',
        // 'userDetail.id',
        // 'userDetail.name',
      ]);
    if (role === UserRole.ADMIN) {
      query.andWhere('account.roles = :roles', { roles: UserRole.ADMIN });
    }
    const result = await query
      .andWhere('account.id = :id OR account.email = :email', {
        id: id,
        email: id,
      })
      .getOne();
    // this.cacheManager.set('userDetail' + id, result, 7 * 24 * 60 * 60 * 1000);
    // }
    if (!result) {
      throw new UnauthorizedException('Account not found!');
    }
    return result;
  };

  findPermission(accountId: string) {
    return this.getPermissions(accountId);
  }

  private getPermissions = async (accountId: string): Promise<any> => {
    // OLD CACHED VERSION (COMMENTED OUT - CAUSED STALE PERMISSIONS)
    // let result = await this.cacheManager.get('userPermission' + accountId);
    // if (!result) {
    //   result = await this.upRepo.find({
    //     relations: ['permission', 'menu'],
    //     where: { accountId, status: true },
    //   });
    //   this.cacheManager.set(
    //     'userPermission' + accountId,
    //     result,
    //     7 * 24 * 60 * 60 * 1000, // 7 days cache
    //   );
    // }
    // return result;

    
    return await this.upRepo.find({
      relations: ['permission', 'menu'],
      where: { accountId, status: true },
    });
  };

  async clearPermissionsCache(accountId: string) {
    await this.cacheManager.del('userPermission' + accountId);
  }

  private getStaffDetailByAccountId = async (
    accountId: string,
  ): Promise<any> => {
    return await this.repo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.staffDetail', 'staffDetail')
      .leftJoinAndSelect('staffDetail.store', 'store')
      .where('account.id = :accountId', { accountId })
      .getOne()
      .then((account) => account?.staffDetail?.[0]);
  };

  async logout(accountId: string, ip: string) {
    const user = await this.repo
      .createQueryBuilder('account')
      .where('account.id = :id', { id: accountId })
      .getOne();

    const latestLogin = await this.loginRepo
      .createQueryBuilder('loginHistory')
      .where(
        'loginHistory.accountId = :accountId AND loginHistory.type = :type',
        {
          accountId: accountId,
          type: LogType.LOGIN,
        },
      )
      .orderBy('loginHistory.createdAt', 'DESC')
      .getOne();
    if (latestLogin) {
      const now = new Date();
      var duration = Math.floor(
        (now.getTime() - new Date(latestLogin.createdAt).getTime()) / 1000,
      ); // in seconds
      // latestLogin.duration = duration;
      // await this.logRepo.save(latestLogin);
    }

    const obj = Object.create({
      loginId: user.email,
      ip: ip,
      type: LogType.LOGOUT,
      duration: duration,
      accountId: accountId,
    });
    return this.loginRepo.save(obj);
  }
  // async changePassword(
  //   accountId: string,
  //   oldPassword: string,
  //   newPassword: string,
  // ) {
  //   const account = await this.repo.findOne({ where: { id: accountId } });

  //   if (!account) {
  //     throw new UnauthorizedException('Account not found');
  //   }

  //   const isOldPasswordValid = await bcrypt.compare(
  //     oldPassword,
  //     account.password,
  //   );
  //   if (!isOldPasswordValid) {
  //     throw new BadRequestException('Old password is incorrect');
  //   }

  //   const hashedNewPassword = await bcrypt.hash(newPassword, 13);
  //   await this.repo.update(accountId, { password: hashedNewPassword });

  //   return { message: 'Password changed successfully' };
  // }
}



