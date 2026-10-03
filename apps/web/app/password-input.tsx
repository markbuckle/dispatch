'use client';

import { type ComponentProps, type FocusEvent, useRef, useState } from 'react';
import { inputField } from './dashboard/field-styles';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type' | 'className' | 'onBlur'>;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  // a revealed password left on screen after the reader moves on is the thing the mask exists to prevent
  function handleBlur(event: FocusEvent) {
    if (!fieldRef.current?.contains(event.relatedTarget)) setIsVisible(false);
  }

  return (
    <div ref={fieldRef} className="group relative flex">
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        onBlur={handleBlur}
        className={`${inputField} w-full pr-11`}
      />
      <button
        type="button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        // keeps focus in the field, so the toggle never blurs the thing it belongs to
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsVisible((current) => !current)}
        onBlur={handleBlur}
        className="dispatch-transition invisible absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-text-muted outline-none group-focus-within:visible hover:text-text-primary focus-visible:shadow-focus"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 16C7.5 9.5 11.75 7 16 7C20.25 7 24.5 9.5 29 16C24.5 22.5 20.25 25 16 25C11.75 25 7.5 22.5 3 16Z" />
      <circle cx="16" cy="16" r="4.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 16C7.5 9.5 11.75 7 16 7C20.25 7 24.5 9.5 29 16C24.5 22.5 20.25 25 16 25C11.75 25 7.5 22.5 3 16Z" />
      <circle cx="16" cy="16" r="4.5" />
      <path d="M6 5L26 27" />
    </svg>
  );
}
