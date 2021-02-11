import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { OauthModule } from './oauth/oauth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_URL, validate as validateDatabase } from './config/database';
import { validate as validateSecurity } from './config/security';
import { validate as validateMailing } from './config/mailing';
import { validate as validateGeneral } from './config/general';
import { PasswordModule } from './password/password.module';
import { AccountModule } from './account/account.module';
import { OAuthMiddleware } from './oauth/middleware/oauth.middleware';
import { OauthController } from './oauth/oauth.controller';
import { BdeModule } from './bde/bde.module';
import { MailingModule } from './mailing/mailing.module';

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
      validate: (config) =>
        validateSecurity(config) &&
        validateDatabase(config) &&
        validateMailing(config) &&
        validateGeneral(config),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: true,
      debug: true,
    }),
    PasswordModule,
    AccountModule,
    BdeModule,
    MailingModule.forRoot(),
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(OAuthMiddleware)
      .exclude(
        { path: 'register', method: RequestMethod.POST },
        { path: 'token', method: RequestMethod.POST },
      )
      .forRoutes(OauthController);
  }
}
