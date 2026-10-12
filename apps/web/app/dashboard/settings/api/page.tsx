import {
  type ApiEmailSummary,
  type ApiList,
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
} from '@dispatch/core/api';
import { emailRangeValues } from '@dispatch/core/email-ranges';
import { emailStatus } from '@dispatch/db';
import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import { API_BASE_URL } from '../../../../lib/api-url';
import { permissionLabels } from '../../api-keys/permissions';
import { CopyButton } from '../../copy-button';
import { CopyField } from '../../copy-field';

// String.raw so the line continuations survive: a lone backslash before a newline is one inside a template literal
const sendRequest = String.raw`curl -X POST ${API_BASE_URL}/v1/emails \
  -H "Authorization: Bearer $DISPATCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "receipts@yourdomain.com",
    "to": "someone@example.com",
    "subject": "Your receipt",
    "html": "<p>Thanks for your order.</p>"
  }'`;

const listRequest = String.raw`curl "${API_BASE_URL}/v1/emails?status=bounced&range=7d" \
  -H "Authorization: Bearer $DISPATCH_API_KEY"`;

// typed as the api's own response, so the sample cannot drift from what the endpoint returns
const listResponse: ApiList<ApiEmailSummary> = {
  object: 'list',
  has_more: true,
  data: [
    {
      id: '8f14e45f-ceea-467a-9f1a-7b0d1e3a4c52',
      from: 'receipts@yourdomain.com',
      to: ['someone@example.com'],
      subject: 'Your receipt',
      status: 'bounced',
      created_at: '2026-10-12T09:14:03.512Z',
    },
  ],
};

const fullAccess = permissionLabels.full_access;

const endpoints = [
  {
    method: 'POST',
    path: '/v1/emails',
    returns: 'Queues an email and returns its id',
    key: 'Any key',
  },
  {
    method: 'GET',
    path: '/v1/emails',
    returns: 'Your emails, filtered by status and range',
    key: fullAccess,
  },
  {
    method: 'GET',
    path: '/v1/emails/:id',
    returns: 'One email, with its html and text bodies',
    key: fullAccess,
  },
  { method: 'GET', path: '/v1/domains', returns: 'Your domains', key: fullAccess },
  {
    method: 'GET',
    path: '/v1/domains/:id',
    returns: 'One domain, with the DKIM records to add',
    key: fullAccess,
  },
  { method: 'GET', path: '/v1/templates', returns: 'Your templates', key: fullAccess },
  {
    method: 'GET',
    path: '/v1/templates/:id',
    returns: 'One template, with its html and text bodies',
    key: fullAccess,
  },
];

const parameters: { name: string; description: ReactNode }[] = [
  {
    name: 'limit',
    description: `From 1 to ${MAX_LIST_LIMIT}. Defaults to ${DEFAULT_LIST_LIMIT}.`,
  },
  { name: 'after', description: 'The id of the last item on a page. Returns the page after it.' },
  {
    name: 'before',
    description: 'The id of the first item on a page. Returns the page before it.',
  },
  {
    name: 'status',
    description: (
      <>
        Emails only. One of <Values values={emailStatus.enumValues} />.
      </>
    ),
  },
  {
    name: 'range',
    description: (
      <>
        Emails only. One of <Values values={emailRangeValues} />. Leave it out for every email.
      </>
    ),
  },
];

export const metadata: Metadata = {
  title: 'API - Dispatch',
};

export default function ApiSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Connection</h2>
        <div className="flex flex-col gap-5 rounded-lg border border-border-default p-5">
          <Field label="Base URL">
            <CopyField value={API_BASE_URL} label="base url" />
          </Field>
          <Field label="Authorization header">
            <CopyField
              value="Authorization: Bearer DISPATCH_API_KEY"
              label="authorization header"
            />
          </Field>
          <p className="text-caption text-text-muted">
            Dispatch sends over REST. There is no SMTP interface. Create a key under API keys, then
            send it on every request.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Endpoints</h2>
        <div className="overflow-x-auto rounded-lg border border-border-default">
          <table className="w-full border-collapse text-body">
            <thead className="bg-subtle">
              <tr>
                <Th>Method</Th>
                <Th>Path</Th>
                <Th>Returns</Th>
                <Th>Key</Th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint) => (
                <tr
                  key={`${endpoint.method} ${endpoint.path}`}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="h-row px-5 align-middle font-mono text-mono text-text-secondary">
                    {endpoint.method}
                  </td>
                  <td className="h-row whitespace-nowrap px-5 align-middle font-mono text-mono text-text-primary">
                    {endpoint.path}
                  </td>
                  <td className="h-row px-5 align-middle text-text-secondary">
                    {endpoint.returns}
                  </td>
                  <td className="h-row whitespace-nowrap px-5 align-middle text-text-muted">
                    {endpoint.key}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-caption text-text-muted">
          Reading needs a full access key, and a full access key can also send. There's no read-only
          key yet, so a script or agent you let read your data can also send email as you.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Sending an email</h2>
        <CodeBlock language="shell" value={sendRequest} label="curl command" />
        <p className="text-caption text-text-muted">
          The from address has to be on a domain you've verified under Domains, or the send returns
          403. A subdomain needs adding in its own right.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Listing emails</h2>
        <CodeBlock language="shell" value={listRequest} label="list request" />
        <CodeBlock
          language="json"
          value={JSON.stringify(listResponse, null, 2)}
          label="list response"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">List parameters</h2>
        <div className="flex flex-col gap-5 rounded-lg border border-border-default p-5">
          <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3">
            {parameters.map((parameter) => (
              <Fragment key={parameter.name}>
                <dt className="font-mono text-mono text-text-primary">{parameter.name}</dt>
                <dd className="text-meta text-text-secondary">{parameter.description}</dd>
              </Fragment>
            ))}
          </dl>
          <p className="text-caption text-text-muted">
            Every list returns <Code>object</Code>, <Code>has_more</Code> and <Code>data</Code>,
            newest first. While <Code>has_more</Code> is true, pass the last id as{' '}
            <Code>after</Code> for the next page. A cursor that doesn't match an item in the list
            returns 400.
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[7px]">
      <span className="text-caption font-medium text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function CodeBlock({ language, value, label }: { language: string; value: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <div className="flex items-center justify-between gap-4 border-b border-border-subtle bg-subtle px-3 py-2">
        <span className="font-mono text-micro text-text-muted">{language}</span>
        <CopyButton value={value} label={label} />
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-mono text-text-secondary">{value}</pre>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="h-header-row whitespace-nowrap px-5 text-left text-meta font-medium text-text-secondary"
    >
      {children}
    </th>
  );
}

function Code({ children }: { children: string }) {
  return <code className="font-mono text-text-secondary">{children}</code>;
}

function Values({ values }: { values: readonly string[] }) {
  return values.map((value, index) => (
    <Fragment key={value}>
      {index > 0 && ', '}
      <Code>{value}</Code>
    </Fragment>
  ));
}
