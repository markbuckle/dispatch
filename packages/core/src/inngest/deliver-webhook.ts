import { findDelivery, recordDeliveryAttempt } from '@dispatch/db';
import { NonRetriableError } from 'inngest';
import { checkDeliveryUrl } from '../webhooks/deliver-url-guard';
import { signPayload } from '../webhooks/sign';
import { inngest } from './client';
import { webhookDeliveryQueued } from './events';

// the wait before each attempt, so five entries is five attempts and the first one does not wait
const ATTEMPT_DELAYS_SECONDS = [0, 5, 300, 1800, 7200] as const;

const REQUEST_TIMEOUT_MS = 10_000;

type AttemptOutcome =
  | { settled: 'succeeded' }
  | { settled: 'failed' }
  | { settled: 'skipped'; status: string }
  | { settled: 'retrying' };

// null when no attempt is owed after this one, which is what makes this attempt the last
async function attemptDelivery(
  deliveryId: string,
  nextDelaySeconds: number | null,
): Promise<AttemptOutcome> {
  const delivery = await findDelivery(deliveryId);
  // no number of retries makes a deleted row appear
  if (!delivery) throw new NonRetriableError(`No delivery row for ${deliveryId}`);

  // a replay resets the row, so an attempt from the older run stands down rather than sending twice
  if (delivery.status !== 'pending') return { settled: 'skipped', status: delivery.status };

  const unsuccessful =
    nextDelaySeconds === null
      ? { status: 'failed' as const }
      : {
          status: 'pending' as const,
          nextAttemptAt: new Date(Date.now() + nextDelaySeconds * 1000),
        };
  const outcome: AttemptOutcome =
    nextDelaySeconds === null ? { settled: 'failed' } : { settled: 'retrying' };

  const allowed = await checkDeliveryUrl(delivery.url);
  if (!allowed.ok) {
    await recordDeliveryAttempt(deliveryId, { ...unsuccessful, error: allowed.reason });
    return outcome;
  }

  const timestampSeconds = Math.floor(Date.now() / 1000);
  const signed = signPayload({
    secret: delivery.signingSecret,
    messageId: delivery.messageId,
    timestampSeconds,
    payload: JSON.stringify(delivery.payload),
  });

  try {
    const response = await fetch(delivery.url, {
      method: 'POST',
      headers: { ...signed.headers, 'content-type': 'application/json' },
      // the signed body rather than a fresh stringify, so what is sent is what was signed
      body: signed.body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) {
      await recordDeliveryAttempt(deliveryId, {
        status: 'succeeded',
        responseStatus: response.status,
      });
      return { settled: 'succeeded' };
    }

    await recordDeliveryAttempt(deliveryId, {
      ...unsuccessful,
      responseStatus: response.status,
      error: `The endpoint answered ${response.status}.`,
    });
  } catch (error) {
    // a timeout and a refused connection both arrive here, and neither carries a status code
    const reason = error instanceof Error ? error.message : String(error);
    await recordDeliveryAttempt(deliveryId, { ...unsuccessful, error: reason });
  }

  return outcome;
}

export const deliverWebhook = inngest.createFunction(
  // Inngest's own retries are off, so the schedule and every response code live in rows a user can read
  { id: 'deliver-webhook', triggers: [webhookDeliveryQueued], retries: 0 },
  async ({ event, step }) => {
    const { deliveryId } = event.data;

    for (const [index, delaySeconds] of ATTEMPT_DELAYS_SECONDS.entries()) {
      if (delaySeconds > 0) await step.sleep(`wait-${index}`, `${delaySeconds}s`);

      const nextDelaySeconds = ATTEMPT_DELAYS_SECONDS[index + 1] ?? null;
      const outcome = await step.run(`attempt-${index}`, () =>
        attemptDelivery(deliveryId, nextDelaySeconds),
      );

      if (outcome.settled !== 'retrying') return outcome;
    }

    return { settled: 'failed' };
  },
);
