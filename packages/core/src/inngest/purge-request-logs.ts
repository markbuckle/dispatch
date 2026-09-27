import { deleteRequestLogsBatch } from '@dispatch/db';
import { logger } from '../logger';
import { inngest } from './client';

// long enough to debug last month's integration, short enough that the table stays small
export const REQUEST_LOG_RETENTION_DAYS = 30;

// rows are around 100 bytes with no cascades, so a batch holds its locks for milliseconds
const BATCH_SIZE = 5000;

// a run that keeps finding full batches is a bug to notice, not a backlog to chew through at any cost
const MAX_BATCHES_PER_RUN = 100;

const DAY_MS = 24 * 60 * 60 * 1000;

export const purgeRequestLogs = inngest.createFunction(
  // 4 or 5am in North America, where the traffic is; the only cron in the system, so nothing to avoid
  { id: 'purge-request-logs', triggers: [{ cron: 'TZ=UTC 0 9 * * *' }] },
  async ({ step }) => {
    // fixed once and memoized, so rows ageing past the window mid-run cannot keep the loop going
    const before = await step.run('cutoff', () =>
      new Date(Date.now() - REQUEST_LOG_RETENTION_DAYS * DAY_MS).toISOString(),
    );

    let deleted = 0;
    for (let batch = 1; batch <= MAX_BATCHES_PER_RUN; batch++) {
      // a distinct id per batch, because Inngest memoizes by id and a repeat would replay batch one
      const count = await step.run(`purge-batch-${batch}`, () =>
        deleteRequestLogsBatch({ before: new Date(before), limit: BATCH_SIZE }),
      );
      deleted += count;

      if (count < BATCH_SIZE) {
        logger.info('request logs purged', { deleted, batches: batch });
        return { deleted };
      }
    }

    logger.warn('request log purge hit its batch cap, the rest waits for the next run', {
      deleted,
      batches: MAX_BATCHES_PER_RUN,
    });
    return { deleted, capped: true };
  },
);
