import Link from 'next/link';
import { primaryButton } from '../button-styles';
import { EmptyState } from '../empty-state';
import { listTemplates } from './actions';
import { TemplatesTable } from './templates-table';

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-display text-h1 text-text-primary">Templates</h1>
        {templates.length > 0 && (
          <Link href="/dashboard/templates/new" className={primaryButton}>
            New template
          </Link>
        )}
      </header>
      {templates.length > 0 ? (
        <TemplatesTable templates={templates} />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="No templates yet"
            body="Write an email once, leave {{variable}} placeholders in it, and fill them in at send time."
            action={
              <Link href="/dashboard/templates/new" className={primaryButton}>
                New template
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
