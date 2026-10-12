import type { ApiKeySummary } from '@dispatch/db';

export type ApiKeyPermission = ApiKeySummary['permission'];

export const permissionLabels: Record<ApiKeyPermission, string> = {
  full_access: 'Full access',
  sending_access: 'Sending access',
};

export const permissionOptions: { value: ApiKeyPermission; description: string }[] = [
  {
    value: 'full_access',
    description:
      'Send email, and read email, domains, and templates. Includes anything the API adds later.',
  },
  { value: 'sending_access', description: 'Send email. Nothing else.' },
];
