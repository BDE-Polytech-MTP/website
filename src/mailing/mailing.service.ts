import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getTestMessageUrl } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ResourceOwner } from '../models/resource-owner.entity';
import { join } from 'path';
import { readFile } from 'fs';
import { MAILING_RECIPIENT } from '../config/mailing';
import { SITE_URL } from '../config/general';
import Mail from 'nodemailer/lib/mailer';

// TODO: Handle all the mailing part using a Bull Queue (see: https://docs.nestjs.com/techniques/queues)

@Injectable()
export class MailingService {
  private templates: Record<string, string> = {};
  private transport: nodemailer.Transporter;
  private readonly logger = new Logger(MailingService.name);

  constructor(
    private config: ConfigService,
    @Inject('MAILING_TRANSPORT') transport: nodemailer.Transporter,
  ) {
    this.transport = transport;
  }

  private getFromRecipient() {
    return `"BDE Polytech" <${this.config.get(MAILING_RECIPIENT)}>`;
  }

  private getFrontURL() {
    return this.config.get(SITE_URL);
  }

  async sendRegistrationMail(user: ResourceOwner) {
    const registerURL = `${this.getFrontURL()}/compte/reset-password?token=${
      user.resetPasswordToken
    }`;
    const renderedTemplate = await this.renderTemplate('registration.html', {
      registerURL,
      frontURL: this.getFrontURL(),
    });

    await this.sendMail({
      to: user.email,
      subject: 'Inscription sur le site web du BDE',
      text: `Inscrivez-vous sur le site du BDE à l'URL suivante: ${registerURL}`,
      html: renderedTemplate,
    });
  }

  async sendResetPasswordMail(user: ResourceOwner) {
    const resetURL = `${this.getFrontURL()}/compte/reset-password?token=${
      user.resetPasswordToken
    }`;
    const renderedTemplate = await this.renderTemplate('reset-password.html', {
      resetURL,
      frontURL: this.getFrontURL(),
    });

    await this.sendMail({
      to: user.email,
      subject: 'Changement de mot de passe',
      text: `Changez votre mot de passe à l'URL suivante: ${resetURL}`,
      html: renderedTemplate,
    });
  }

  private async renderTemplate(
    templateName: string,
    values: Record<string, string>,
  ) {
    let template = await this.getTemplate(templateName);
    Object.entries(values).forEach(([key, value]) => {
      template = template.split(`{{${key}}}`).join(value); // Hacky: use replaceAll when Node 15
    });
    return template;
  }

  private async getTemplate(templateName: string) {
    if (!this.templates[templateName]) {
      try {
        this.templates[templateName] = await this.loadTemplate(templateName);
      } catch (e) {
        this.logger.error(e);
        throw new InternalServerErrorException();
      }
    }
    return this.templates[templateName];
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = join(
      __dirname,
      '..',
      '..',
      'mail-templates',
      templateName,
    );
    return new Promise((resolve, reject) => {
      readFile(templatePath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          this.logger.log(err);
          reject(`Unable to load mail template ${templatePath}`);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async sendMail(options: Mail.Options) {
    const info = await this.transport.sendMail({
      from: this.getFromRecipient(),
      ...options,
    });
    const previewURL = getTestMessageUrl(info);
    if (previewURL) {
      this.logger.log(`Preview URL for mail: ${previewURL}`);
    }
  }
}
