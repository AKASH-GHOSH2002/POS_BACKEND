import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from 'src/account/entities/account.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './strategy/jwt.strategy';
import { CaslAbilityFactory } from './factory/casl-ability.factory';
import { PermissionsGuard } from './guards/permissions.guard';
import { UserPermission } from 'src/user-permissions/entities/user-permission.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { LoginHistory } from 'src/loginHistory/entities/login-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account,LoginHistory, UserPermission, StaffDetail]),
  
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        return {
          secret: process.env.POS_JWT_SECRET,
          signOptions: {
            expiresIn: process.env.POS_JWT_EXPIRE,
          },
        };
      },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CaslAbilityFactory, PermissionsGuard],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    JwtModule,
    CaslAbilityFactory,
    PermissionsGuard,
  ],
})
export class AuthModule {}
