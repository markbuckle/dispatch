import http from 'node:http';
import https from 'node:https';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../logger';
import { ConsoleTransport } from './transport';

const params = {
  from: 'dispatch@mail.dispatchit.ca',
  to: ['someone@example.com'],
  subject: 'Your receipt',
  html: '<p>Thanks for your order</p>',
  text: 'Thanks for your order',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConsoleTransport', () => {
  it('logs the send', async () => {
    const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);

    const { providerMessageId } = await new ConsoleTransport().send(params);

    expect(info).toHaveBeenCalledWith('email sent', {
      transport: 'console',
      providerMessageId,
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
  });

  it('returns an id that cannot be mistaken for an SES message id', async () => {
    vi.spyOn(logger, 'info').mockImplementation(() => logger);

    const { providerMessageId } = await new ConsoleTransport().send(params);

    expect(providerMessageId).toMatch(/^console_[0-9a-f-]{36}$/);
  });

  it('makes no network call', async () => {
    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    // the three ways anything in this process could reach SES, including the AWS SDK's own handler
    const request = vi.spyOn(http, 'request');
    const secureRequest = vi.spyOn(https, 'request');
    const fetch = vi.spyOn(globalThis, 'fetch');

    await new ConsoleTransport().send(params);

    expect(request).not.toHaveBeenCalled();
    expect(secureRequest).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
