import type { Template } from '@dispatch/db';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatRelative, formatUtc } from '../format-time';
import { DeleteTemplateButton } from './delete-template-button';

export function TemplatesTable({ templates }: { templates: Template[] }) {
  const now = Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>Name</Th>
            <Th>Subject</Th>
            <Th>Last updated</Th>
            <th className="h-header-row px-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr
              key={template.id}
              className="dispatch-transition relative border-b border-border-subtle last:border-b-0 hover:bg-surface"
            >
              <td className="h-row px-5 align-middle text-text-primary">
                {/* stretched over the row, so the whole row opens the editor and this stays a real link */}
                <Link
                  href={`/dashboard/templates/${template.id}`}
                  className="rounded-xs text-text-primary outline-none after:absolute after:inset-0 focus-visible:shadow-focus"
                >
                  {template.name}
                </Link>
              </td>
              <td className="h-row px-5 align-middle text-text-secondary">{template.subject}</td>
              <td className="h-row px-5 align-middle text-text-muted">
                <time
                  dateTime={template.updatedAt.toISOString()}
                  title={formatUtc(template.updatedAt)}
                >
                  {formatRelative(template.updatedAt, now)}
                </time>
              </td>
              <td className="h-row px-5 align-middle">
                {/* positioned, or the link stretched across the row would sit over this button */}
                <div className="relative flex items-center justify-end gap-2">
                  <DeleteTemplateButton id={template.id} name={template.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
