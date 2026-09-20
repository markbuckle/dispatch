import {
  AlreadyExistsException,
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  type DkimAttributes,
  GetEmailIdentityCommand,
  NotFoundException,
  SESv2Client,
  type VerificationStatus,
} from '@aws-sdk/client-sesv2';
import { requireEnv } from '../env';

// callers match on these instead of importing the AWS SDK to recognise its exceptions
export class DomainAlreadyExistsError extends Error {
  constructor(domain: string) {
    super(`An SES identity already exists for ${domain}`);
    this.name = 'DomainAlreadyExistsError';
  }
}

export class DomainNotFoundError extends Error {
  constructor(domain: string) {
    super(`No SES identity exists for ${domain}`);
    this.name = 'DomainNotFoundError';
  }
}

export type DomainStatus = 'not_started' | 'pending' | 'verified' | 'failed' | 'temporary_failure';

export type DomainIdentity = {
  status: DomainStatus;
  dkimTokens: string[];
  dkimHostedZone: string;
};

const DOMAIN_STATUS: Record<VerificationStatus, DomainStatus> = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  SUCCESS: 'verified',
  FAILED: 'failed',
  TEMPORARY_FAILURE: 'temporary_failure',
};

let ses: SESv2Client | undefined;

// read on first call, like getDb, so importing core never requires AWS config
function getSes(): SESv2Client {
  if (!ses) {
    ses = new SESv2Client({
      region: requireEnv('SES_REGION'),
      // explicit keys, because the SDK's default chain would fall back to a local ~/.aws profile with wider access
      credentials: {
        accessKeyId: requireEnv('SES_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('SES_SECRET_ACCESS_KEY'),
      },
    });
  }
  return ses;
}

function toDomainIdentity(
  domain: string,
  status: VerificationStatus | undefined,
  dkim: DkimAttributes | undefined,
): DomainIdentity {
  // an identity without its DKIM records can never be verified, so storing one would strand the domain
  if (!status || !dkim?.Tokens?.length || !dkim.SigningHostedZone) {
    throw new Error(`SES returned an incomplete identity for ${domain}`);
  }
  return {
    status: DOMAIN_STATUS[status],
    dkimTokens: dkim.Tokens,
    dkimHostedZone: dkim.SigningHostedZone,
  };
}

export async function createDomainIdentity(domain: string): Promise<DomainIdentity> {
  const identity = await getSes()
    .send(new CreateEmailIdentityCommand({ EmailIdentity: domain }))
    .catch((error: unknown) => {
      throw error instanceof AlreadyExistsException ? new DomainAlreadyExistsError(domain) : error;
    });
  // CreateEmailIdentity returns no VerificationStatus, and a domain identity is verified by its DKIM records
  return toDomainIdentity(domain, identity.DkimAttributes?.Status, identity.DkimAttributes);
}

export async function getDomainIdentity(domain: string): Promise<DomainIdentity> {
  const identity = await getSes()
    .send(new GetEmailIdentityCommand({ EmailIdentity: domain }))
    .catch((error: unknown) => {
      throw error instanceof NotFoundException ? new DomainNotFoundError(domain) : error;
    });
  return toDomainIdentity(domain, identity.VerificationStatus, identity.DkimAttributes);
}

export async function deleteDomainIdentity(domain: string): Promise<void> {
  await getSes()
    .send(new DeleteEmailIdentityCommand({ EmailIdentity: domain }))
    .catch((error: unknown) => {
      // an identity that is already gone is the outcome a delete wants, so a row can always be removed
      if (!(error instanceof NotFoundException)) throw error;
    });
}
