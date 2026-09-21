// the focus ring and 44px control height come from tokens.css, matching the input in add-domain-dialog
const focusable =
  'dispatch-transition rounded-md border border-border-default bg-surface text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]';

export const fieldLabel = 'text-caption font-medium text-text-secondary';

export const inputField = `${focusable} h-control-lg px-3.5 text-body`;

export const smallInputField = `${focusable} h-control-sm px-3 text-meta`;

// mono because an html body is something a developer reads and copies, per foundations/typography.md
export const textareaField = `${focusable} resize-y px-3.5 py-3 font-mono text-mono`;
