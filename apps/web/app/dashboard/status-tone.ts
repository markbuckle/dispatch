// the semantic set from foundations/color.md that a table row's pill and status tile share
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'off';

export const pillTones: Record<StatusTone, string> = {
  success: 'bg-success-bg text-success-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
  neutral: 'bg-neutral-bg text-neutral-fg',
  off: 'bg-off-bg text-off-fg',
};
