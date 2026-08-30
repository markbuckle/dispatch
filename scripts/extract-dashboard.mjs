// Dashboard token extractor — for pages behind auth.
//
//   cd C:\Users\Marks-Desktop\Coding\dispatch
//   node scripts\extract-dashboard.mjs https://resend.com/emails emails.json
//
// A real Chromium window opens. Log in by hand. The script waits until you're off
// the login page, then dumps computed styles and a screenshot. The profile persists
// in .pw-profile/, so the second and later runs skip the login.
//
// Requires: npm install playwright   (already done)

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const TARGET = process.argv[2] || 'https://resend.com/emails';
const OUT = process.argv[3] || 'dashboard-extract.json';
const PROFILE = path.resolve('.pw-profile');
const LOGIN_RE = /\/(login|signup|sign-in|auth)/;

const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});

const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(TARGET, { waitUntil: 'domcontentloaded' });

if (LOGIN_RE.test(new URL(page.url()).pathname)) {
  console.log('\n  Login page detected. Sign in in the browser window.');
  console.log('  Waiting up to 5 minutes...\n');
}

await page.waitForURL((u) => !LOGIN_RE.test(new URL(u).pathname), { timeout: 300000 });
await page.goto(TARGET, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3500);

const landed = page.url();
if (LOGIN_RE.test(new URL(landed).pathname)) {
  console.error(`\n  Still on ${landed} — not authenticated. Nothing written.`);
  await ctx.close();
  process.exit(1);
}
console.log(`  Extracting ${landed}`);

const data = await page.evaluate(() => {
  const PROPS = [
    'backgroundColor', 'color', 'borderTopColor', 'borderTopWidth', 'borderBottomWidth',
    'borderStyle', 'borderRadius', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
    'letterSpacing', 'textTransform', 'padding', 'height', 'minHeight', 'gap',
    'boxShadow', 'outline', 'opacity',
    'transitionProperty', 'transitionDuration', 'transitionTimingFunction',
  ];

  const pick = (el) => {
    const cs = getComputedStyle(el);
    const o = {
      tag: el.tagName.toLowerCase(),
      classes: (el.getAttribute('class') || '').slice(0, 90),
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44),
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
    };
    for (const p of PROPS) o[p] = cs[p];
    return o;
  };

  const sample = (sel, n = 6) =>
    [...document.querySelectorAll(sel)].filter((el) => el.getBoundingClientRect().width > 0).slice(0, n).map(pick);

  // Every CSS custom property resolved on :root
  const rootCS = getComputedStyle(document.documentElement);
  const cssVariables = {};
  for (const name of rootCS) {
    if (name.startsWith('--')) cssVariables[name] = rootCS.getPropertyValue(name).trim();
  }

  // Census helper: value -> count, sorted desc
  const census = (fn) => {
    const m = new Map();
    for (const el of document.querySelectorAll('*')) {
      const v = fn(getComputedStyle(el), el);
      if (v == null || v === '' || v === 'none' || v === '0s' || v === 'normal') continue;
      m.set(v, (m.get(v) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22).map(([value, count]) => ({ value, count }));
  };

  return {
    url: location.href,
    title: document.title,
    extractedAt: new Date().toISOString(),
    viewport: { w: innerWidth, h: innerHeight },
    cssVariables,

    // The motion data the marketing pages never gave up
    motion: {
      durations: census((cs) => cs.transitionDuration),
      easings: census((cs) => cs.transitionTimingFunction),
      properties: census((cs) => cs.transitionProperty),
      animations: census((cs) => (cs.animationName === 'none' ? null : `${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction}`)),
    },

    censuses: {
      radius: census((cs) => cs.borderRadius),
      borderColor: census((cs) => (parseFloat(cs.borderTopWidth) > 0 ? cs.borderTopColor : null)),
      background: census((cs) => (cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? null : cs.backgroundColor)),
      textColor: census((cs) => cs.color),
      fontSize: census((cs) => cs.fontSize),
      gap: census((cs) => cs.gap),
      boxShadow: census((cs) => cs.boxShadow),
      rowHeight: census((cs, el) => {
        const t = el.tagName.toLowerCase();
        if (t !== 'tr' && el.getAttribute('role') !== 'row') return null;
        return Math.round(el.getBoundingClientRect().height) + 'px';
      }),
    },

    components: {
      table: sample('table', 3),
      tableHeadCell: sample('thead th, [role="columnheader"]', 8),
      tableRow: sample('tbody tr, [role="row"]', 8),
      tableCell: sample('tbody td, [role="gridcell"], [role="cell"]', 10),
      button: sample('button, [role="button"]', 12),
      link: sample('a[href]', 10),
      input: sample('input:not([type="hidden"]), textarea', 8),
      select: sample('select, [role="combobox"]', 6),
      checkbox: sample('input[type="checkbox"], [role="checkbox"]', 4),
      tab: sample('[role="tab"]', 6),
      badge: sample('[class*="badge" i], [class*="status" i], [class*="pill" i], [class*="tag" i]', 12),
      sidebar: sample('aside, nav, [class*="sidebar" i]', 4),
      sidebarItem: sample('aside a, nav a, [class*="sidebar" i] a', 12),
      menu: sample('[role="menu"], [role="listbox"], [data-radix-popper-content-wrapper]', 4),
      dialog: sample('[role="dialog"], [role="alertdialog"]', 3),
      tooltip: sample('[role="tooltip"]', 3),
      heading: sample('h1, h2, h3', 8),
      mono: sample('code, pre, [class*="mono" i]', 8),
      svgIcon: (() => {
        const out = [];
        for (const s of [...document.querySelectorAll('svg')].slice(0, 14)) {
          const r = s.getBoundingClientRect();
          if (!r.width) continue;
          const cs = getComputedStyle(s);
          out.push({
            w: Math.round(r.width), h: Math.round(r.height),
            viewBox: s.getAttribute('viewBox'),
            strokeWidth: s.getAttribute('stroke-width') || cs.strokeWidth,
            stroke: cs.stroke, fill: cs.fill,
            paths: s.querySelectorAll('path, circle, rect, line').length,
          });
        }
        return out;
      })(),
    },

    // Radix Primitives leave data-* attributes behind — proves which primitives are in use
    radixAttrs: (() => {
      const s = new Set();
      for (const el of document.querySelectorAll('*')) {
        for (const a of el.attributes) {
          if (a.name.startsWith('data-radix') || (a.name.startsWith('data-') && /state|orientation|side|align|highlighted|disabled/.test(a.name))) {
            s.add(a.name);
          }
        }
      }
      return [...s].sort();
    })(),
  };
});

await fs.writeFile(OUT, JSON.stringify(data, null, 2), 'utf8');
const shot = OUT.replace(/\.json$/, '') + '.png';
await page.screenshot({ path: shot, fullPage: true });

console.log(`\n  Wrote ${OUT}`);
console.log(`  Wrote ${shot}`);
console.log(`  ${Object.keys(data.cssVariables).length} CSS variables · ${data.motion.durations.length} transition durations · ${data.radixAttrs.length} Radix attrs\n`);

await ctx.close();
