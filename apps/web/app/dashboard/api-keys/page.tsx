import { EmptyState } from '../empty-state';

export default function ApiKeysPage() {
  return (
    <EmptyState
      title="No API keys yet"
      body="Key generation hasn't shipped. You'll create and revoke keys from here."
    />
  );
}
