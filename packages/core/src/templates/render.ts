export type TemplateContent = {
  subject: string;
  html: string;
  text?: string;
};

export type TemplateVariables = Record<string, string>;

export type RenderedTemplate = {
  subject: string;
  html: string;
  text?: string;
};

export type RenderTemplateResult =
  | { ok: true; rendered: RenderedTemplate }
  | { ok: false; missing: string[] };

// a name is anything braceless and unspaced, so {{user.name}} is a key that can go missing rather than literal output a recipient sees
const PLACEHOLDER = /\{\{\s*[^{}\s]+\s*\}\}/g;

// the braces are fixed width, so slicing beats a capture group that types as possibly undefined
function nameOf(placeholder: string): string {
  return placeholder.slice(2, -2).trim();
}

// ampersand first, or it would escape the ampersands the later replacements introduce
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fill(
  content: string,
  variables: TemplateVariables,
  missing: string[],
  escapeValue?: (value: string) => string,
): string {
  return content.replace(PLACEHOLDER, (placeholder) => {
    const name = nameOf(placeholder);
    const value = variables[name];

    if (value === undefined) {
      if (!missing.includes(name)) missing.push(name);
      return placeholder;
    }

    return escapeValue ? escapeValue(value) : value;
  });
}

// every missing name comes back at once, and the failing branch carries no bodies, so a half rendered send cannot compile
export function renderTemplate(
  template: TemplateContent,
  variables: TemplateVariables,
): RenderTemplateResult {
  const missing: string[] = [];

  const subject = fill(template.subject, variables, missing);
  // values are escaped because a variable carries a value, never markup
  const html = fill(template.html, variables, missing, escapeHtml);
  const text = template.text === undefined ? undefined : fill(template.text, variables, missing);

  if (missing.length > 0) return { ok: false, missing };

  return { ok: true, rendered: { subject, html, ...(text !== undefined && { text }) } };
}
