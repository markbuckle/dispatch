import { EmptyState } from '../empty-state';

// Both the list and a detail route render this, because a feature behind a flag is not a missing page
export function WebhooksDisabled() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-h1 text-text-primary">Webhooks</h1>
      </header>
      <div className="rounded-lg border border-border-default">
        <EmptyState
          title="Webhooks aren't on for this account"
          body="Dispatch signs every delivery and retries a failed one 4 times over 2.5 hours. This page opens once webhooks are switched on."
        />
      </div>
    </div>
  );
}
