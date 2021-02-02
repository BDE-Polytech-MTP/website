import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { OauthModule } from './oauth/oauth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate as validateDatabase, DATABASE_URL } from './config/database';
import { validate as validateSecurity } from './config/security';
import { PasswordModule } from './password/password.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    OauthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        synchronize: true,
        url: config.get(DATABASE_URL),
        autoLoadEntities: true,
      }),
    }),
    ConfigModule.forRoot({
      cache: true,
      validate: (config) => validateSecurity(validateDatabase(config)),
    }),
    PasswordModule,
    AccountModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
