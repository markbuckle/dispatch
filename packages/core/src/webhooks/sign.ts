import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SECRET_PREFIX = 'whsec_';
const SIGNATURE_VERSION = 'v1';

// 32 bytes is the HMAC-SHA256 output width, so the key is never the weakest part of the construction
const SECRET_BYTES = 32;

// the window Standard Webhooks specifies, so a replayed request stops verifying five minutes after it was signed
const TOLERANCE_SECONDS = 300;

export function generateSigningSecret(): string {
  return `${SECRET_PREFIX}${randomBytes(SECRET_BYTES).toString('base64')}`;
}

// generated once per delivery and resent by every retry, because it is the receiver's idempotency key
export function generateMessageId(): string {
  return `msg_${randomBytes(16).toString('hex')}`;
}

// the prefix labels the secret for humans and is not key material, so it comes off before decoding
function secretKey(secret: string): Buffer {
  return Buffer.from(secret.slice(SECRET_PREFIX.length), 'base64');
}

function computeSignature(
  secret: string,
  messageId: string,
  timestampSeconds: number,
  payload: string,
): string {
  return createHmac('sha256', secretKey(secret))
    .update(`${messageId}.${timestampSeconds}.${payload}`)
    .digest('base64');
}

export type SignPayloadInput = {
  secret: string;
  messageId: string;
  // Unix seconds; a milliseconds value would verify here and fall outside every real receiver's window
  timestampSeconds: number;
  payload: string;
};

export type SignedRequest = {
  body: string;
  headers: Record<string, string>;
};

// the body is returned because a second JSON.stringify can reorder keys and void the signature
export function signPayload({
  secret,
  messageId,
  timestampSeconds,
  payload,
}: SignPayloadInput): SignedRequest {
  const signature = computeSignature(secret, messageId, timestampSeconds, payload);

  return {
    body: payload,
    headers: {
      'webhook-id': messageId,
      'webhook-timestamp': String(timestampSeconds),
      'webhook-signature': `${SIGNATURE_VERSION},${signature}`,
    },
  };
}

export type VerifySignatureInput = SignPayloadInput & {
  header: string;
};

export function verifySignature({
  secret,
  messageId,
  timestampSeconds,
  payload,
  header,
}: VerifySignatureInput): boolean {
  const now = Math.floor(Date.now() / 1000);
  // a future timestamp is as suspect as an expired one, so the window is checked in both directions
  if (Math.abs(now - timestampSeconds) > TOLERANCE_SECONDS) return false;

  const expected = Buffer.from(
    computeSignature(secret, messageId, timestampSeconds, payload),
    'base64',
  );

  // a rotating sender signs one request with both secrets, so the header carries several signatures
  return header.split(' ').some((candidate) => {
    const [version, signature] = candidate.split(',');
    if (version !== SIGNATURE_VERSION || signature === undefined) return false;

    const presented = Buffer.from(signature, 'base64');
    // timingSafeEqual throws on a length mismatch, and a wrong-length signature is already a reject
    if (presented.length !== expected.length) return false;

    return timingSafeEqual(presented, expected);
  });
}
