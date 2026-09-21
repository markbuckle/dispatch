import * as csstree from 'css-tree';
import { Parser } from 'htmlparser2';
import type { DeclarationSource } from './types';

export type ExtractedDeclaration = {
  property: string;
  value: string;
  source: DeclarationSource;
  usesVar: boolean;
};

function usesVarFunction(value: csstree.CssNode): boolean {
  let found = false;

  csstree.walk(value, {
    visit: 'Function',
    enter(node) {
      if (node.name.toLowerCase() === 'var') found = true;
    },
  });

  return found;
}

function readDeclarations(
  css: string,
  source: DeclarationSource,
  into: ExtractedDeclaration[],
): void {
  let ast: csstree.CssNode;

  try {
    ast = csstree.parse(css, {
      context: source === 'style-attribute' ? 'declarationList' : 'stylesheet',
      // a template is arbitrary user input, so a malformed rule should cost its own declaration and nothing else
      onParseError: () => {},
    });
  } catch {
    return;
  }

  csstree.walk(ast, {
    visit: 'Declaration',
    enter(node) {
      into.push({
        // kept as authored, because --Brand and --brand are two different custom properties
        property: node.property,
        value: csstree.generate(node.value).trim(),
        source,
        usesVar: usesVarFunction(node.value),
      });
    },
  });
}

// htmlparser2 leaves conditional comment bodies as comment text, so markup gated to Outlook never reaches a check
export function extractDeclarations(html: string): ExtractedDeclaration[] {
  const declarations: ExtractedDeclaration[] = [];
  let inStyleElement = false;

  const parser = new Parser(
    {
      onopentag(name) {
        if (name === 'style') inStyleElement = true;
      },
      onclosetag(name) {
        if (name === 'style') inStyleElement = false;
      },
      ontext(text) {
        if (inStyleElement) readDeclarations(text, 'style-element', declarations);
      },
      onattribute(name, value) {
        if (name === 'style') readDeclarations(value, 'style-attribute', declarations);
      },
    },
    { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true },
  );

  parser.write(html);
  parser.end();

  return declarations;
}
