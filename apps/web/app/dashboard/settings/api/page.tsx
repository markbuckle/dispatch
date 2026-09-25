import type { ReactNode } from 'react';
import { API_BASE_URL } from '../../../../lib/api-url';
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
        <h2 className="text-meta font-medium text-text-secondary">Sending an email</h2>
        <div className="overflow-hidden rounded-lg border border-border-default">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle bg-subtle px-3 py-2">
            <span className="font-mono text-micro text-text-muted">shell</span>
            <CopyButton value={sendRequest} label="curl command" />
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-mono text-text-secondary">
            {sendRequest}
          </pre>
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
