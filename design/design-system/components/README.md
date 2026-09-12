# components/

React + Tailwind v4 starters. Every value comes from `../tokens/tokens.css` - no hardcoded hexes.

These are **starters, not a library.** Copy them into your codebase and own them. They assume Radix Primitives for behaviour (confirmed in use on the reference product via `data-radix-*` attributes) and `clsx` + `tailwind-merge` for class composition.

| File | Radix primitive |
|---|---|
| `Button.tsx` | - |
| `Input.tsx` | - |
| `StatusPill.tsx` (+ `StatusTile`) | - |
| `Card.tsx` | - |
| `Table.tsx` | - |
| `Select.tsx` | `@radix-ui/react-select` |
| `Checkbox.tsx` | `@radix-ui/react-checkbox` |
| `Switch.tsx` | `@radix-ui/react-switch` |
| `Tabs.tsx` | `@radix-ui/react-tabs` |
| `DropdownMenu.tsx` | `@radix-ui/react-dropdown-menu` |
| `Dialog.tsx` | `@radix-ui/react-dialog` |
| `Toast.tsx` | `@radix-ui/react-toast` |
| `Tooltip.tsx` | `@radix-ui/react-tooltip` |
| `Skeleton.tsx` | - |
| `CodeBlock.tsx` | - |
| `MetricTile.tsx` | - |
| `EmptyState.tsx` | - |

## Shared conventions

- **Heights:** 42px product controls, 44px inputs and nav items, 34px small, 28px pills, 60px table rows.
- **Radius:** `rounded-md` (11px) on controls, `rounded-lg` (12px) on cards, tables and overlays, `rounded-chip` (9px) on small buttons, `rounded-sm` (8px) on pills.
- **Type:** `text-body` (16px) is the default. `text-meta` (15px) for table headers and secondary metadata, `text-mono` (13.5px) for mono.
- **Focus:** every interactive element gets `focus-visible:shadow-focus` and `outline-none`. Never remove the ring.
- **Motion:** `duration-fast ease-out` on colour and border. `duration-overlay ease-standard` on anything that enters or leaves.
- **Disabled:** `disabled:cursor-not-allowed` plus a step down in colour. Never `opacity-50` - it makes text fail contrast.
- **Icons:** Lucide at `strokeWidth={2.25}` with `absoluteStrokeWidth`.

## The `cn` helper

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
