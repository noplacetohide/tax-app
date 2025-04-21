import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Investment } from './investments/entities/investment.entity';
import { InvestmentsModule } from './investments/investments.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsFilter } from './exception.filter';


@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter
    }
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Investment],
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: {
          ca: configService.get('DB_CA_CERT'),
          rejectUnauthorized: false
        },
      }),
    }),
    AuthModule,
    UsersModule,
    InvestmentsModule,
  ],
})
export class AppModule { }