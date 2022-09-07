import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly _logger = new Logger(MailService.name);
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendMail(
    mailSales: SendGrid.MailDataRequired,
    mailCustomer: SendGrid.MailDataRequired,
  ) {
    const transport = await SendGrid.send(mailSales).then(async () => {
      return await SendGrid.send(mailCustomer);
    });

    console.log(`Email successfully dispatched`);
    return transport;
  }
}
