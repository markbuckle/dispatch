import { createVerify, type KeyObject, X509Certificate } from 'node:crypto';

export type SnsMessageType =
  | 'Notification'
  | 'SubscriptionConfirmation'
  | 'UnsubscribeConfirmation';

export type SnsMessage = {
  Type: SnsMessageType;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  Signature: string;
  SignatureVersion: string;
  SigningCertURL: string;
  Subject?: string;
  Token?: string;
  SubscribeURL?: string;
};

export type SnsCheck = { ok: true; message: SnsMessage } | { ok: false; reason: string };

export type CertificateFetcher = (url: string) => Promise<KeyObject>;

// only the hosts SNS itself signs from, checked as a whole host rather than a suffix a lookalike could wear
const SIGNING_HOST = /^sns\.[a-z0-9-]+\.amazonaws\.com$/;

// the documented field order per type, which is part of what is signed and is not the same for both
const SIGNED_FIELDS: Record<SnsMessageType, (keyof SnsMessage)[]> = {
  Notification: ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'],
  SubscriptionConfirmation: [
    'Message',
    'MessageId',
    'SubscribeURL',
    'Timestamp',
    'Token',
    'TopicArn',
    'Type',
  ],
  UnsubscribeConfirmation: [
    'Message',
    'MessageId',
    'SubscribeURL',
    'Timestamp',
    'Token',
    'TopicArn',
    'Type',
  ],
};

// SHA1 only for the version 1 signatures still in the wild, and never as a fallback for a version we do not know
const ALGORITHMS: Record<string, string> = { '1': 'RSA-SHA1', '2': 'RSA-SHA256' };

const certificates = new Map<string, KeyObject>();

async function fetchCertificate(url: string): Promise<KeyObject> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Certificate fetch answered ${response.status}`);

  return new X509Certificate(await response.text()).publicKey;
}

function canonicalString(message: SnsMessage): string {
  const fields = SIGNED_FIELDS[message.Type];
  let canonical = '';
  for (const field of fields) {
    const value = message[field];
    // an absent optional field is skipped entirely rather than signed as empty
    if (typeof value !== 'string') continue;
    canonical += `${field}\n${value}\n`;
  }

  return canonical;
}

export type VerifySnsInput = {
  message: SnsMessage;
  expectedTopicArn: string;
  fetchKey?: CertificateFetcher;
};

export async function verifySnsMessage({
  message,
  expectedTopicArn,
  fetchKey = fetchCertificate,
}: VerifySnsInput): Promise<SnsCheck> {
  if (!SIGNED_FIELDS[message.Type]) {
    return { ok: false, reason: `Unknown SNS message type ${message.Type}.` };
  }

  // a valid signature proves SNS sent it, not that our topic did, so the arn is its own check
  if (message.TopicArn !== expectedTopicArn) {
    return { ok: false, reason: `Message is for another topic: ${message.TopicArn}.` };
  }

  let certUrl: URL;
  try {
    certUrl = new URL(message.SigningCertURL);
  } catch {
    return { ok: false, reason: 'The signing certificate URL could not be parsed.' };
  }

  // before the fetch, or a caller supplies a certificate of their own and signs whatever they like
  if (certUrl.protocol !== 'https:' || !SIGNING_HOST.test(certUrl.hostname)) {
    return { ok: false, reason: `Signing certificate URL is not an SNS host: ${certUrl.host}.` };
  }

  const algorithm = ALGORITHMS[message.SignatureVersion];
  if (!algorithm) {
    return { ok: false, reason: `Unknown SNS signature version ${message.SignatureVersion}.` };
  }

  let key = certificates.get(message.SigningCertURL);
  if (!key) {
    try {
      key = await fetchKey(message.SigningCertURL);
    } catch {
      return { ok: false, reason: 'The signing certificate could not be fetched.' };
    }
    certificates.set(message.SigningCertURL, key);
  }

  const verifier = createVerify(algorithm);
  verifier.update(canonicalString(message), 'utf8');
  if (!verifier.verify(key, message.Signature, 'base64')) {
    return { ok: false, reason: 'The SNS signature did not verify.' };
  }

  return { ok: true, message };
}
