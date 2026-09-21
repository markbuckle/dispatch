import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkCompatibility } from './check-compatibility';

function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
}

function triggers(html: string): string[] {
  return checkCompatibility(html).findings.map(
    (finding) => `${finding.trigger.property}: ${finding.trigger.value}`,
  );
}

describe('checkCompatibility, against real templates that avoid the risky features', () => {
  it('finds nothing in a production table based template', () => {
    expect(checkCompatibility(fixture('cerberus-fluid.html')).findings).toEqual([]);
  });

  it('does not read background-position as position', () => {
    expect(checkCompatibility(fixture('cerberus-responsive.html')).findings).toEqual([]);
  });
});

describe('checkCompatibility, against the documents caniemail tests real clients with', () => {
  it('reports the clients caniemail publishes for flexbox', () => {
    const { findings } = checkCompatibility(fixture('caniemail-css-flexbox.html'));
    const [flex] = findings;

    expect(findings).toHaveLength(2);
    expect(flex?.feature).toBe('display:flex');
    expect(flex?.slug).toBe('css-display-flex');
    expect(flex?.severity).toBe('unsupported');
    // the figure caniemail.com prints on the feature page
    expect(flex?.supportScore).toBe(82.93);
    expect(flex?.clients).toEqual([
      { family: 'GMX', platform: 'Desktop Webmail', version: '2022-06', level: 'unsupported' },
      { family: 'Orange', platform: 'Android', version: '2024-04', level: 'unsupported' },
      { family: 'Orange', platform: 'Desktop Webmail', version: '2024-04', level: 'unsupported' },
      { family: 'Orange', platform: 'iOS', version: '2024-04', level: 'unsupported' },
      { family: 'Outlook', platform: 'Windows', version: '2019', level: 'unsupported' },
      { family: 'Outlook', platform: 'Windows Mail', version: '2019-02', level: 'unsupported' },
      { family: 'WEB.DE', platform: 'Desktop Webmail', version: '2022-06', level: 'unsupported' },
      {
        family: 'Gmail',
        platform: 'Android',
        version: '2026-03',
        level: 'partial',
        note: 'Not supported with non Google accounts.',
      },
      {
        family: 'Gmail',
        platform: 'iOS',
        version: '2026-03',
        level: 'partial',
        note: 'Not supported with non Google accounts.',
      },
    ]);
  });

  it('separates declaring a custom property from reading one', () => {
    const { findings } = checkCompatibility(fixture('caniemail-css-variables.html'));

    expect(triggers(fixture('caniemail-css-variables.html'))).toEqual([
      '--test1: green',
      '--test2: green',
      'background: var(--test1)',
      'background: var(--test2)',
    ]);
    expect(findings[0]?.supportScore).toBe(45.24);
    expect(findings[0]?.clients).toHaveLength(23);
    // every Outlook caniemail tests fails outright, which is what makes this the worst of the four
    expect(findings[0]?.clients.filter((client) => client.family === 'Outlook')).toHaveLength(6);
  });

  it('flags every positioned element and leaves position:static alone', () => {
    expect(triggers(fixture('caniemail-css-positioning.html'))).toEqual([
      'position: absolute',
      'position: fixed',
      'position: relative',
      'position: sticky',
    ]);
  });

  it('flags grid', () => {
    const { findings } = checkCompatibility(fixture('caniemail-css-grid.html'));

    expect(findings).toHaveLength(1);
    expect(findings[0]?.slug).toBe('css-display-grid');
    expect(findings[0]?.trigger).toEqual({
      property: 'display',
      value: 'grid',
      source: 'style-attribute',
    });
  });
});

describe('checkCompatibility, reading the html', () => {
  it('reads a style element, including rules nested in a media query', () => {
    const { findings } = checkCompatibility(
      `<html><head><style>
        @media screen and (max-width: 600px) { .row { display: flex; } }
        .card { position: absolute; }
      </style></head><body><p>hi</p></body></html>`,
    );

    expect(findings.map((finding) => finding.trigger)).toEqual([
      { property: 'position', value: 'absolute', source: 'style-element' },
      { property: 'display', value: 'flex', source: 'style-element' },
    ]);
  });

  it('skips markup a conditional comment gates to Outlook', () => {
    const findings = checkCompatibility(
      '<body><!--[if mso]><div style="display:flex">outlook</div><![endif]--><p>fine</p></body>',
    ).findings;

    expect(findings).toEqual([]);
  });

  it('checks markup a conditional comment hides from Outlook', () => {
    expect(
      triggers('<body><!--[if !mso]><!--><div style="display:flex">x</div><!--<![endif]--></body>'),
    ).toEqual(['display: flex']);
  });

  it('matches a property whatever its case', () => {
    expect(triggers('<div STYLE="DISPLAY : FLEX">x</div>')).toEqual(['DISPLAY: FLEX']);
  });

  it('keeps a custom property name as authored, because its case is meaningful', () => {
    expect(triggers('<div style="--Brand: red">x</div>')).toEqual(['--Brand: red']);
  });

  it('collapses the same mistake repeated down a template', () => {
    expect(triggers('<div style="display:flex"><div style="display:flex">x</div></div>')).toEqual([
      'display: flex',
    ]);
  });

  it('keeps going after a malformed declaration', () => {
    expect(triggers('<div style="color:;display:flex;border">x</div>')).toEqual(['display: flex']);
  });

  it('returns nothing for html with no css at all', () => {
    expect(checkCompatibility('<p>plain</p>').findings).toEqual([]);
  });

  it('names the snapshot it judged against', () => {
    const { snapshot } = checkCompatibility('<p>plain</p>');

    expect(snapshot.apiVersion).toBe('1.0.4');
    expect(snapshot.lastUpdateDate).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(snapshot.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
