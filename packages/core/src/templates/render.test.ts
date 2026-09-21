import { describe, expect, it } from 'vitest';
import { renderTemplate, templateVariableNames } from './render';

const template = {
  subject: 'Welcome, {{name}}',
  html: '<p>Hello {{name}}, your plan is {{plan}}.</p>',
  text: 'Hello {{name}}, your plan is {{plan}}.',
};

describe('renderTemplate', () => {
  it('fills every placeholder in the subject, html and text', () => {
    const result = renderTemplate(template, { name: 'Ada', plan: 'Pro' });

    expect(result).toEqual({
      ok: true,
      rendered: {
        subject: 'Welcome, Ada',
        html: '<p>Hello Ada, your plan is Pro.</p>',
        text: 'Hello Ada, your plan is Pro.',
      },
    });
  });

  it('accepts spaces inside the braces', () => {
    const result = renderTemplate(
      { subject: '{{  name  }}', html: '<p>{{ name }}</p>' },
      {
        name: 'Ada',
      },
    );

    expect(result).toEqual({ ok: true, rendered: { subject: 'Ada', html: '<p>Ada</p>' } });
  });

  it('fills every occurrence of a repeated name', () => {
    const result = renderTemplate(
      { subject: 'x', html: '<p>{{name}} {{name}}</p>' },
      {
        name: 'Ada',
      },
    );

    expect(result).toEqual({ ok: true, rendered: { subject: 'x', html: '<p>Ada Ada</p>' } });
  });

  it('treats a supplied empty string as a value rather than a missing variable', () => {
    const result = renderTemplate({ subject: 'Hi{{suffix}}', html: '<p>Hi</p>' }, { suffix: '' });

    expect(result).toEqual({ ok: true, rendered: { subject: 'Hi', html: '<p>Hi</p>' } });
  });

  it('ignores variables the template does not use', () => {
    const result = renderTemplate(
      { subject: '{{name}}', html: '<p>{{name}}</p>' },
      {
        name: 'Ada',
        unused: 'x',
      },
    );

    expect(result).toEqual({ ok: true, rendered: { subject: 'Ada', html: '<p>Ada</p>' } });
  });

  it('omits text when the template has none', () => {
    const result = renderTemplate(
      { subject: '{{name}}', html: '<p>{{name}}</p>' },
      {
        name: 'Ada',
      },
    );

    expect(result.ok && 'text' in result.rendered).toBe(false);
  });

  it('does not expand a placeholder that arrives inside a value', () => {
    const result = renderTemplate(
      { subject: '{{name}}', html: '<p>ok</p>' },
      {
        name: '{{plan}}',
        plan: 'Pro',
      },
    );

    expect(result).toEqual({ ok: true, rendered: { subject: '{{plan}}', html: '<p>ok</p>' } });
  });

  it('escapes markup characters in the html body', () => {
    const result = renderTemplate(
      { subject: 'x', html: '<p>{{name}}</p>' },
      {
        name: '<script>alert("x")</script> & \'co\'',
      },
    );

    expect(result).toEqual({
      ok: true,
      rendered: {
        subject: 'x',
        html: '<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;co&#39;</p>',
      },
    });
  });

  it('leaves the subject and text unescaped, because neither is markup', () => {
    const result = renderTemplate(
      { subject: '{{company}}', html: '<p>ok</p>', text: '{{company}}' },
      { company: "Ben & Jerry's" },
    );

    expect(result).toEqual({
      ok: true,
      rendered: { subject: "Ben & Jerry's", html: '<p>ok</p>', text: "Ben & Jerry's" },
    });
  });

  it('refuses to render when a variable is missing', () => {
    const result = renderTemplate(template, { name: 'Ada' });

    expect(result).toEqual({ ok: false, missing: ['plan'] });
  });

  it('reports a name missing from the text body alone', () => {
    const result = renderTemplate(
      { subject: 'x', html: '<p>ok</p>', text: 'Sent by {{sender}}' },
      {},
    );

    expect(result).toEqual({ ok: false, missing: ['sender'] });
  });

  it('reports every missing name once, in the order it appears', () => {
    const result = renderTemplate(
      { subject: '{{plan}}', html: '<p>{{name}} {{plan}}</p>', text: '{{city}}' },
      {},
    );

    expect(result).toEqual({ ok: false, missing: ['plan', 'name', 'city'] });
  });

  it('reports a dotted name as missing rather than mailing it out literally', () => {
    const result = renderTemplate({ subject: 'x', html: '<p>{{user.name}}</p>' }, { user: 'Ada' });

    expect(result).toEqual({ ok: false, missing: ['user.name'] });
  });

  it('leaves a handlebars block opener alone but reports its closer', () => {
    const opener = renderTemplate({ subject: 'x', html: '<p>{{#if plan}}</p>' }, {});
    const closer = renderTemplate({ subject: 'x', html: '<p>{{/if}}</p>' }, {});

    expect(opener).toEqual({ ok: true, rendered: { subject: 'x', html: '<p>{{#if plan}}</p>' } });
    expect(closer).toEqual({ ok: false, missing: ['/if'] });
  });
});

describe('templateVariableNames', () => {
  it('lists every name across the subject, html and text, once each, in order', () => {
    expect(templateVariableNames(template)).toEqual(['name', 'plan']);
  });

  it('returns nothing for a template with no placeholders', () => {
    expect(templateVariableNames({ subject: 'Receipt', html: '<p>Thanks</p>' })).toEqual([]);
  });

  it('lists a name the variables object would have to spell exactly', () => {
    expect(templateVariableNames({ subject: '{{ user.name }}', html: '<p>ok</p>' })).toEqual([
      'user.name',
    ]);
  });

  it('agrees with what renderTemplate reports missing when nothing is supplied', () => {
    const result = renderTemplate(template, {});

    expect(result.ok === false && result.missing).toEqual(templateVariableNames(template));
  });
});
