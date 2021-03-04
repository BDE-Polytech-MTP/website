import { Module } from '@nestjs/common';
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
import { BdeModule } from './bde/bde.module';
import { MailingModule } from './mailing/mailing.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventsModule } from './events/events.module';

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
      playground: process.env.NODE_END === 'production' ? false : true,
      debug: process.env.NODE_END === 'production' ? false : true,
    }),
    PasswordModule,
    AccountModule,
    BdeModule,
    MailingModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'website-front', 'dist'),
      exclude: ['/api*', '/graphql', '/oauth*', '/doc*'],
    }),
    EventsModule,
  ],
  controllers: [],
})
export class AppModule {}
