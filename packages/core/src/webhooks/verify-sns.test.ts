import { createSign, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { type SnsMessage, verifySnsMessage } from './verify-sns';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

const TOPIC = 'arn:aws:sns:us-east-1:123456789012:dispatch-ses-events';

// each test signs against its own cert url, because a verified key is cached against that url
let certificateCounter = 0;
function freshCertUrl(host = 'sns.us-east-1.amazonaws.com'): string {
  certificateCounter += 1;
  return `https://${host}/SimpleNotificationService-${certificateCounter}.pem`;
}

function canonical(message: SnsMessage): string {
  const order =
    message.Type === 'Notification'
      ? (['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'] as const)
      : ([
          'Message',
          'MessageId',
          'SubscribeURL',
          'Timestamp',
          'Token',
          'TopicArn',
          'Type',
        ] as const);

  let text = '';
  for (const field of order) {
    const value = message[field];
    if (typeof value !== 'string') continue;
    text += `${field}\n${value}\n`;
  }

  return text;
}

function sign(message: Omit<SnsMessage, 'Signature'>): SnsMessage {
  const signer = createSign('RSA-SHA256');
  signer.update(canonical({ ...message, Signature: '' }), 'utf8');

  return { ...message, Signature: signer.sign(privateKey, 'base64') };
}

function notification(overrides: Partial<SnsMessage> = {}): SnsMessage {
  return sign({
    Type: 'Notification',
    MessageId: 'b3f1c0de-0000-4000-8000-000000000001',
    TopicArn: TOPIC,
    Message: JSON.stringify({ eventType: 'Delivery' }),
    Timestamp: '2026-09-23T00:00:00.000Z',
    SignatureVersion: '2',
    SigningCertURL: freshCertUrl(),
    ...overrides,
  });
}

const servesKey = () => vi.fn(async () => publicKey);

describe('verifySnsMessage', () => {
  it('accepts a message this key really signed', async () => {
    const result = await verifySnsMessage({
      message: notification(),
      expectedTopicArn: TOPIC,
      fetchKey: servesKey(),
    });

    expect(result.ok).toBe(true);
  });

  it('accepts a subscription confirmation, which signs a different set of fields', async () => {
    const message = sign({
      Type: 'SubscriptionConfirmation',
      MessageId: 'b3f1c0de-0000-4000-8000-000000000002',
      TopicArn: TOPIC,
      Message: 'You have chosen to subscribe to the topic',
      Token: 'a-token',
      SubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription',
      Timestamp: '2026-09-23T00:00:00.000Z',
      SignatureVersion: '2',
      SigningCertURL: freshCertUrl(),
    });

    const result = await verifySnsMessage({
      message,
      expectedTopicArn: TOPIC,
      fetchKey: servesKey(),
    });

    expect(result.ok).toBe(true);
  });

  it('rejects a certificate URL on a host that is not SNS, without fetching it', async () => {
    const fetchKey = servesKey();
    const result = await verifySnsMessage({
      message: notification({
        SigningCertURL: freshCertUrl('sns.us-east-1.amazonaws.com.evil.test'),
      }),
      expectedTopicArn: TOPIC,
      fetchKey,
    });

    expect(result.ok).toBe(false);
    // the assertion that matters: a caller cannot make us fetch a certificate of their choosing
    expect(fetchKey).not.toHaveBeenCalled();
  });

  it('rejects a certificate URL that is not https, without fetching it', async () => {
    const fetchKey = servesKey();
    const result = await verifySnsMessage({
      message: notification({ SigningCertURL: 'http://sns.us-east-1.amazonaws.com/cert.pem' }),
      expectedTopicArn: TOPIC,
      fetchKey,
    });

    expect(result.ok).toBe(false);
    expect(fetchKey).not.toHaveBeenCalled();
  });

  it('rejects a message for another topic, without fetching the certificate', async () => {
    const fetchKey = servesKey();
    const result = await verifySnsMessage({
      message: notification({ TopicArn: 'arn:aws:sns:us-east-1:999999999999:someone-else' }),
      expectedTopicArn: TOPIC,
      fetchKey,
    });

    expect(result.ok).toBe(false);
    expect(fetchKey).not.toHaveBeenCalled();
  });

  it('rejects a message whose body was edited after signing', async () => {
    const message = notification();
    const result = await verifySnsMessage({
      message: { ...message, Message: JSON.stringify({ eventType: 'Bounce' }) },
      expectedTopicArn: TOPIC,
      fetchKey: servesKey(),
    });

    expect(result.ok).toBe(false);
  });

  it('rejects a message whose timestamp was edited after signing', async () => {
    const message = notification();
    const result = await verifySnsMessage({
      message: { ...message, Timestamp: '2026-09-24T00:00:00.000Z' },
      expectedTopicArn: TOPIC,
      fetchKey: servesKey(),
    });

    expect(result.ok).toBe(false);
  });

  it('rejects a signature made by a different key', async () => {
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const result = await verifySnsMessage({
      message: notification(),
      expectedTopicArn: TOPIC,
      fetchKey: async () => other.publicKey,
    });

    expect(result.ok).toBe(false);
  });

  it('rejects a signature version it does not know', async () => {
    const result = await verifySnsMessage({
      message: notification({ SignatureVersion: '3' }),
      expectedTopicArn: TOPIC,
      fetchKey: servesKey(),
    });

    expect(result.ok).toBe(false);
  });

  it('rejects when the certificate cannot be fetched', async () => {
    const result = await verifySnsMessage({
      message: notification(),
      expectedTopicArn: TOPIC,
      fetchKey: async () => {
        throw new Error('403');
      },
    });

    expect(result.ok).toBe(false);
  });

  it('fetches a certificate once per URL and serves the rest from cache', async () => {
    const SigningCertURL = freshCertUrl();
    const fetchKey = servesKey();

    for (let i = 0; i < 3; i += 1) {
      const result = await verifySnsMessage({
        message: notification({ SigningCertURL }),
        expectedTopicArn: TOPIC,
        fetchKey,
      });
      expect(result.ok).toBe(true);
    }

    expect(fetchKey).toHaveBeenCalledTimes(1);
  });
});
