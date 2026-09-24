import { EmptyState } from '../empty-state';
import { listLogs } from './actions';
import { LogsTable } from './logs-table';

export default async function LogsPage() {
  const logs = await listLogs();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-h1 text-text-primary">Logs</h1>
      </header>
      {logs.length > 0 ? (
        <LogsTable logs={logs} />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="No requests yet"
            body="Every call your API key makes to Dispatch is recorded here."
          />
        </div>
      )}
    </div>
  );
}
