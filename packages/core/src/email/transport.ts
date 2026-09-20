import { randomUUID } from 'node:crypto';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { requireEnv } from '../env';
import { logger } from '../logger';

export type SendEmailParams = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  providerMessageId: string;
};

export interface Transport {
  send(params: SendEmailParams): Promise<SendEmailResult>;
}

export class ConsoleTransport implements Transport {
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    // prefixed so a row written in dev can never be mistaken for one SES issued
    const providerMessageId = `console_${randomUUID()}`;

    logger.info('email sent', {
      transport: 'console',
      providerMessageId,
      from: params.from,
      to: params.to,
      subject: params.subject,
      // the text body is the readable one, and the html would bury it
      text: params.text,
    });

    return { providerMessageId };
  }
}

let sender: SESv2Client | undefined;

// read on first call, like getSes, so importing core never requires AWS config
function getSender(): SESv2Client {
  if (!sender) {
    sender = new SESv2Client({
      // its own principal, because sending and identity management are different blast radiuses
      region: requireEnv('SES_SENDER_REGION'),
      credentials: {
        accessKeyId: requireEnv('SES_SENDER_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('SES_SENDER_SECRET_ACCESS_KEY'),
      },
    });
  }
  return sender;
}

export class SesTransport implements Transport {
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const response = await getSender().send(
      new SendEmailCommand({
        FromEmailAddress: params.from,
        Destination: { ToAddresses: params.to },
        Content: {
          Simple: {
            Subject: { Data: params.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: params.html, Charset: 'UTF-8' },
              Text: { Data: params.text, Charset: 'UTF-8' },
            },
          },
        },
      }),
    );

    // the SDK types MessageId as optional, and a send we cannot identify is a row we cannot reconcile
    if (!response.MessageId) {
      throw new Error('SES accepted the send without returning a message id');
    }

    return { providerMessageId: response.MessageId };
  }
}
