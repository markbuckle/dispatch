'use client';

import type { Template } from '@dispatch/db';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useId, useState, useTransition } from 'react';
import { primaryButton, secondaryButton } from '../button-styles';
import { fieldLabel, inputField, textareaField } from '../field-styles';
import { createTemplate, updateTemplate } from './actions';
import { TemplatePreview } from './template-preview';

// the engine roughly doubles this page's javascript, so only an account the flag lets in downloads it
const CompatibilityPanel = dynamic(() =>
  import('./compatibility-panel').then((module) => module.CompatibilityPanel),
);

const TEMPLATES_PATH = '/dashboard/templates';

export function TemplateEditor({
  template,
  isCompatibilityCheckerEnabled,
}: {
  template?: Template;
  isCompatibilityCheckerEnabled: boolean;
}) {
  const router = useRouter();
  const nameId = useId();
  const subjectId = useId();
  const htmlId = useId();
  const textId = useId();
  const [name, setName] = useState(template?.name ?? '');
  const [subject, setSubject] = useState(template?.subject ?? '');
  const [html, setHtml] = useState(template?.html ?? '');
  const [text, setText] = useState(template?.text ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const input = { name, subject, html, text };

    startTransition(async () => {
      try {
        const result = template
          ? await updateTemplate(template.id, input)
          : await createTemplate(input);
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        router.push(TEMPLATES_PATH);
      } catch {
        setError("The template wasn't saved. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href={TEMPLATES_PATH}
          className="dispatch-transition w-max rounded-xs text-meta text-text-secondary outline-none hover:text-text-primary focus-visible:shadow-focus"
        >
          Templates
        </Link>
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-display text-h1 text-text-primary">
            {template ? template.name : 'New template'}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={TEMPLATES_PATH} className={secondaryButton}>
              Cancel
            </Link>
            <button type="submit" disabled={isPending} className={primaryButton}>
              {isPending ? 'Saving' : 'Save template'}
            </button>
          </div>
        </header>
        {error && <p className="text-caption text-danger-fg">{error}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Field label="Name" htmlFor={nameId}>
            <input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Welcome email"
              autoComplete="off"
              className={inputField}
            />
          </Field>
          <Field label="Subject" htmlFor={subjectId}>
            <input
              id={subjectId}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Welcome to {{product}}, {{name}}"
              autoComplete="off"
              className={inputField}
            />
          </Field>
          <Field label="HTML" htmlFor={htmlId}>
            <textarea
              id={htmlId}
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              placeholder="<p>Hi {{name}}</p>"
              spellCheck={false}
              rows={16}
              className={textareaField}
            />
          </Field>
          <Field label="Text" htmlFor={textId}>
            <textarea
              id={textId}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Hi {{name}}"
              spellCheck={false}
              rows={6}
              className={textareaField}
            />
          </Field>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {isCompatibilityCheckerEnabled && <CompatibilityPanel html={html} />}
          <TemplatePreview
            template={{ subject, html, text: text.trim() === '' ? undefined : text }}
          />
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={htmlFor} className={fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}
