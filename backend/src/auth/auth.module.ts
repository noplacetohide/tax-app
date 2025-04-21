import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ValidateRegisterMiddleware } from 'src/middleware/validate-register.middleware';
import { ValidateLoginMiddleware } from 'src/middleware/validate-login.middleware';


@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET', 'secret_key'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ValidateRegisterMiddleware)
            .forRoutes({ path: 'api/v1/auth/register', method: RequestMethod.POST });
        consumer.apply(ValidateLoginMiddleware).forRoutes({ path: 'api/v1/auth/login', method: RequestMethod.POST })
    }
}
