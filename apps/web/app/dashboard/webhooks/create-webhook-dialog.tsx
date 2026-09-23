'use client';

import { type FormEvent, useId, useState, useTransition } from 'react';
import { primaryButton, secondaryButton } from '../button-styles';
import { CheckIcon } from '../check-icon';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { fieldLabel, inputField } from '../field-styles';
import { createWebhook } from './actions';
import { type EmailEventType, eventLabels, eventOptions } from './events';

// an endpoint subscribed to nothing looks broken, so the useful default is everything
const ALL_EVENTS = eventOptions.map((option) => option.value);

export function CreateWebhookDialog() {
  const urlId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<EmailEventType[]>(ALL_EVENTS);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setUrl('');
      setEvents(ALL_EVENTS);
      setError(null);
    }
  }

  function toggleEvent(value: EmailEventType) {
    setEvents((current) =>
      current.includes(value) ? current.filter((event) => event !== value) : [...current, value],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await createWebhook({ url, events });
      if (result.status === 'rejected') {
        setError(result.message);
        return;
      }
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className={primaryButton}>Create endpoint</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create endpoint</DialogTitle>
            <DialogDescription>
              Dispatch POSTs a signed payload to this URL when one of these events happens.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-[7px]">
                <label htmlFor={urlId} className={fieldLabel}>
                  Endpoint URL
                </label>
                <input
                  id={urlId}
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://api.example.com/webhooks/dispatch"
                  autoComplete="off"
                  className={`${inputField} font-mono text-mono`}
                />
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className={`pb-[7px] ${fieldLabel}`}>Events</legend>
                {eventOptions.map((option) => {
                  const isChecked = events.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`dispatch-transition flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 has-[:focus-visible]:shadow-focus ${
                        isChecked
                          ? 'border-border-strong bg-hover'
                          : 'border-border-default bg-canvas hover:border-border-strong'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="events"
                        value={option.value}
                        checked={isChecked}
                        onChange={() => toggleEvent(option.value)}
                        className="sr-only"
                      />
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="text-body text-text-primary">
                          {eventLabels[option.value]}
                        </span>
                        <span className="text-caption text-text-muted">{option.description}</span>
                      </span>
                      {isChecked && <CheckIcon />}
                    </label>
                  );
                })}
              </fieldset>

              {error && <p className="text-caption text-danger-fg">{error}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose className={secondaryButton}>Cancel</DialogClose>
            <button
              type="submit"
              disabled={isPending || url.trim() === '' || events.length === 0}
              className={primaryButton}
            >
              {isPending ? 'Creating' : 'Create endpoint'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
