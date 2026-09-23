import { lookup } from 'node:dns/promises';

// terminal means no later attempt can change the answer, so the caller can stop rather than wait
export type UrlCheck = { ok: true } | { ok: false; terminal: boolean; reason: string };

export type AddressResolver = (hostname: string) => Promise<string[]>;

async function resolveAddresses(hostname: string): Promise<string[]> {
  const found = await lookup(hostname, { all: true });
  return found.map((entry) => entry.address);
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split('.').map(Number);
  const [first, second] = parts;
  if (parts.length !== 4 || first === undefined || second === undefined) return true;
  if (parts.some((part) => Number.isNaN(part))) return true;

  // 0.0.0.0/8 reaches this host on Linux, and 127/8 is loopback
  if (first === 0 || first === 127) return true;
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  // 169.254/16 is link-local, which is where every cloud metadata service lives
  if (first === 169 && second === 254) return true;
  // 100.64/10 is carrier grade NAT, routable inside a host's own network
  if (first === 100 && second >= 64 && second <= 127) return true;

  return false;
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase().split('%')[0] ?? '';

  // a v4 address wearing a v6 prefix is the usual way this check gets walked past
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped?.[1]) return isPrivateIpv4(mapped[1]);

  if (normalized === '::1' || normalized === '::') return true;
  // fc00::/7 unique local, fe80::/10 link-local
  if (/^f[cd]/.test(normalized)) return true;
  if (/^fe[89ab]/.test(normalized)) return true;

  return false;
}

function isPrivateAddress(address: string): boolean {
  return address.includes(':') ? isPrivateIpv6(address) : isPrivateIpv4(address);
}

// per attempt rather than at creation, because DNS for a user supplied host can change afterwards
export async function checkDeliveryUrl(
  rawUrl: string,
  resolve: AddressResolver = resolveAddresses,
): Promise<UrlCheck> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    // the stored url is what it is, so re-reading it later reaches the same verdict
    return { ok: false, terminal: true, reason: 'The endpoint URL could not be parsed.' };
  }

  if (url.protocol !== 'https:') {
    return { ok: false, terminal: true, reason: 'The endpoint URL has to use https.' };
  }

  let addresses: string[];
  try {
    // fetch resolves the name again for itself, so this narrows the window rather than closing it
    addresses = await resolve(url.hostname);
  } catch {
    // a resolver that threw has said nothing about the host, and saying nothing is not a verdict
    return {
      ok: false,
      terminal: false,
      reason: `The endpoint host ${url.hostname} could not be looked up.`,
    };
  }

  if (addresses.length === 0) {
    // an unregistered domain can be registered, and broken DNS gets repaired
    return {
      ok: false,
      terminal: false,
      reason: `The endpoint host ${url.hostname} did not resolve.`,
    };
  }

  // every answer has to be public, because fetch may pick any of them
  const blocked = addresses.find(isPrivateAddress);
  if (blocked !== undefined) {
    // a private address is a property of where the name points, and waiting does not move it
    return {
      ok: false,
      terminal: true,
      reason: `The endpoint host resolves to the private address ${blocked}.`,
    };
  }

  return { ok: true };
}
