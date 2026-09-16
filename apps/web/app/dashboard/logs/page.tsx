import { EmptyState } from '../empty-state';

export default function LogsPage() {
  return (
    <EmptyState
      title="No logs yet"
      body="Request and delivery logs will show up here once the send pipeline exists."
    />
  );
}
