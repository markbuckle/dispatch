import { EmptyState } from '../empty-state';
import { listApiKeys } from './actions';
import { ApiKeysTable } from './api-keys-table';
import { CreateApiKeyDialog } from './create-api-key-dialog';

export default async function ApiKeysPage() {
  const keys = await listApiKeys();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-display text-h1 text-text-primary">API keys</h1>
        <CreateApiKeyDialog />
      </header>
      {keys.length > 0 ? (
        <ApiKeysTable keys={keys} />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="No API keys yet"
            body="A key authenticates your requests to Dispatch."
          />
        </div>
      )}
    </div>
  );
}
