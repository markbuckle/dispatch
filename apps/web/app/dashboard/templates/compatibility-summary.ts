import type { ClientSupport, CompatFinding } from '@dispatch/compat';

// the engine orders clients alphabetically, which would headline GMX or AOL over the client a reader actually checks first
const RECOGNISABLE_CLIENTS = [
  { family: 'Outlook', platform: 'Windows' },
  { family: 'Gmail', platform: 'Desktop Webmail' },
  { family: 'Apple Mail', platform: 'iOS' },
  { family: 'Yahoo! Mail', platform: 'Desktop Webmail' },
];

function clientName(client: Pick<ClientSupport, 'family' | 'platform'>): string {
  return `${client.family} ${client.platform}`;
}

export function summariseFindings(findings: CompatFinding[]): string {
  const clients = new Map<string, ClientSupport>();
  for (const finding of findings) {
    for (const client of finding.clients) clients.set(clientName(client), client);
  }

  const recognisable = RECOGNISABLE_CLIENTS.find((client) => clients.has(clientName(client)));
  const [first] = clients.keys();
  const named = recognisable ? clientName(recognisable) : first;

  const count = findings.length;
  const subject = count === 1 ? '1 property degrades' : `${count} properties degrade`;
  if (named === undefined) return subject;

  const others = clients.size - 1;
  if (others === 0) return `${subject} in ${named}`;

  return `${subject} in ${named} and ${others} more ${others === 1 ? 'client' : 'clients'}`;
}

// a flat list of 23 clients is unreadable at caption size, and grouping folds each provider's platforms into one entry
export function groupClients(clients: ClientSupport[]): string {
  const platformsByFamily = new Map<string, string[]>();
  for (const client of clients) {
    const platforms = platformsByFamily.get(client.family) ?? [];
    platforms.push(client.platform);
    platformsByFamily.set(client.family, platforms);
  }

  return [...platformsByFamily]
    .map(([family, platforms]) => `${family} (${platforms.join(', ')})`)
    .join(', ');
}
