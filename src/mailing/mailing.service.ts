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

/**
 * This service is responsible for sending emails.
 */
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

  /**
   * @returns the default recipient to use to send emails with
   */
  private getFromRecipient() {
    return `"BDE Polytech" <${this.config.get(MAILING_RECIPIENT)}>`;
  }

  /**
   * @returns The host name for the frontend
   */
  private getFrontURL() {
    return this.config.get(SITE_URL);
  }

  async sendRegistrationMail(user: ResourceOwner) {
    this.logger.debug(`Sending registration email to ${user.email}`);
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
    this.logger.debug(`Sending password reset email to ${user.email}`);
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

  /**
   * Retrieves template content then replace each occurrence of
   * `{{key}}` with the value of `values[key]`.
   *
   * @param templateName The name of the template to render
   * @param values The values to replace in the template
   * @returns the rendered template
   */
  private async renderTemplate(
    templateName: string,
    values: Record<string, string>,
  ) {
    this.logger.debug(
      `Rendering email template ${templateName} with values: ${JSON.stringify(
        values,
      )}`,
    );
    let template = await this.getTemplate(templateName);
    Object.entries(values).forEach(([key, value]) => {
      template = template.split(`{{${key}}}`).join(value); // Hacky: use replaceAll when Node 15
    });
    return template;
  }

  /**
   * Retrieves template content from cache or loads it from file system.
   *
   * @param templateName The name of the template to retrieve content of
   * @returns the content of the template
   */
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

  /**
   * Reads the content of the file with the given name in the `mail-templates`
   * directory then returns it.
   *
   * @param templateName The name of the template to load
   * @returns the content of the template
   */
  private async loadTemplate(templateName: string): Promise<string> {
    this.logger.debug(`Loading email template ${templateName} ...`);
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
          this.logger.error(`Error loading email template ${templateName}`);
          this.logger.error(err);
          reject(`Unable to load email template ${templatePath}`);
        } else {
          this.logger.debug(`Loaded email template ${templateName}.`);
          resolve(data);
        }
      });
    });
  }

  /**
   * Sends an email using the current `Transporter`.
   *
   * @param options
   */
  private async sendMail(options: Mail.Options) {
    this.logger.debug(`Sending email to ${options.to} ...`);
    const info = await this.transport.sendMail({
      from: this.getFromRecipient(),
      ...options,
    });
    this.logger.debug(`Sent email to ${options.to}.`);
    const previewURL = getTestMessageUrl(info);
    if (previewURL) {
      this.logger.log(`Preview URL for mail: ${previewURL}`);
    }
  }
}
