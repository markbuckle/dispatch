import { dkimRecords } from '@dispatch/core/dkim-records';
import type { Domain } from '@dispatch/db';
import { CopyButton } from '../copy-button';

type DnsRecordsProps = Pick<Domain, 'name' | 'dkimTokens' | 'dkimHostedZone'>;

export function DnsRecords(domain: DnsRecordsProps) {
  const records = dkimRecords(domain);

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-3">
        {records.map((record, index) => (
          <li
            key={record.name}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2.5 rounded-md border border-border-default bg-surface px-3.5 py-3"
          >
            <FieldLabel>Name</FieldLabel>
            <FieldValue>{record.name}</FieldValue>
            <CopyButton value={record.name} label={`name of record ${index + 1}`} />
            <FieldLabel>Value</FieldLabel>
            <FieldValue>{record.value}</FieldValue>
            <CopyButton value={record.value} label={`value of record ${index + 1}`} />
          </li>
        ))}
      </ol>
      <p className="text-caption text-text-muted">
        Some DNS providers add your domain to the name automatically. If yours does, leave it off
        the end.
      </p>
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-caption text-text-muted">{children}</span>;
}

function FieldValue({ children }: { children: string }) {
  return <span className="break-all font-mono text-mono text-text-secondary">{children}</span>;
}
