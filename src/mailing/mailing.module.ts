import { DynamicModule, Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  MAILING_DISABLE_TLS,
  MAILING_HOST,
  MAILING_PASSWORD,
  MAILING_USE_TEST_ACCOUNT,
  MAILING_USERNAME,
} from '../config/mailing';
import * as nodemailer from 'nodemailer';

@Module({})
export class MailingModule {
  static forRoot(): DynamicModule {
    return {
      module: MailingModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MAILING_TRANSPORT',
          useFactory: async (config: ConfigService) => {
            let transport: nodemailer.Transporter;
            if (config.get(MAILING_USE_TEST_ACCOUNT)) {
              transport = await this.createTestTransport();
            } else {
              transport = await this.createConfiguredTransport(config);
            }
            return transport;
          },
          inject: [ConfigService],
        },
        MailingService,
      ],
    };
  }

  static async createTestTransport() {
    const account = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: account,
    });
  }

  static async createConfiguredTransport(config: ConfigService) {
    return nodemailer.createTransport({
      host: config.get(MAILING_HOST),
      secure: false,
      ignoreTLS: config.get(MAILING_DISABLE_TLS),
      auth: {
        user: config.get(MAILING_USERNAME),
        pass: config.get(MAILING_PASSWORD),
      },
    });
  }
}
