import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppService } from './app.service';
import { OauthModule } from './oauth/oauth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_URL, validate as validateDatabase } from './config/database';
import { validate as validateSecurity } from './config/security';
import { PasswordModule } from './password/password.module';
import { AccountModule } from './account/account.module';
import { OAuthMiddleware } from './oauth/middleware/oauth.middleware';
import { OauthController } from './oauth/oauth.controller';
import { BdeModule } from './bde/bde.module';

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
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: true,
      debug: true,
    }),
    PasswordModule,
    AccountModule,
    BdeModule,
  ],
  controllers: [],
  providers: [AppService],
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
