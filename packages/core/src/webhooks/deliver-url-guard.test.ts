import { describe, expect, it } from 'vitest';
import { type AddressResolver, checkDeliveryUrl } from './deliver-url-guard';

// injected so the suite never depends on a real DNS answer, which would change under it
function resolvesTo(...addresses: string[]): AddressResolver {
  return async () => addresses;
}

const PUBLIC = resolvesTo('93.184.216.34');

describe('checkDeliveryUrl', () => {
  it('accepts an https url on a public address', async () => {
    expect(await checkDeliveryUrl('https://api.example.com/hooks', PUBLIC)).toEqual({ ok: true });
  });

  it('rejects a url that is not https, and says no later attempt will differ', async () => {
    const result = await checkDeliveryUrl('http://api.example.com/hooks', PUBLIC);

    expect(result).toMatchObject({
      ok: false,
      terminal: true,
      reason: expect.stringContaining('https'),
    });
  });

  it.each([
    ['loopback', '127.0.0.1'],
    ['a private class A address', '10.0.0.7'],
    ['a private class B address', '172.16.4.2'],
    ['a private class C address', '192.168.1.10'],
    ['the cloud metadata address', '169.254.169.254'],
    ['the unspecified address', '0.0.0.0'],
    ['carrier grade NAT', '100.64.0.1'],
  ])('rejects %s as terminal', async (_label, address) => {
    const result = await checkDeliveryUrl('https://internal.example.com', resolvesTo(address));

    expect(result).toMatchObject({
      ok: false,
      terminal: true,
      reason: expect.stringContaining(address),
    });
  });

  it.each([
    ['IPv6 loopback', '::1'],
    ['a unique local address', 'fd00::1'],
    ['an IPv6 link-local address', 'fe80::1'],
    ['an IPv4 loopback wearing an IPv6 prefix', '::ffff:127.0.0.1'],
    ['the metadata address wearing an IPv6 prefix', '::ffff:169.254.169.254'],
  ])('rejects %s as terminal', async (_label, address) => {
    const result = await checkDeliveryUrl('https://internal.example.com', resolvesTo(address));

    expect(result).toMatchObject({ ok: false, terminal: true });
  });

  it('rejects a host where only one of several answers is private', async () => {
    const result = await checkDeliveryUrl(
      'https://split.example.com',
      resolvesTo('93.184.216.34', '10.0.0.7'),
    );

    expect(result).toMatchObject({ ok: false, terminal: true });
  });

  // a name that resolves to nothing today can resolve tomorrow, so these two keep their attempts
  it('rejects a host that does not resolve, without calling it terminal', async () => {
    const result = await checkDeliveryUrl('https://nowhere.example.com', resolvesTo());

    expect(result).toMatchObject({ ok: false, terminal: false });
  });

  it('rejects a host whose lookup throws, without calling it terminal', async () => {
    const result = await checkDeliveryUrl('https://nowhere.example.com', async () => {
      throw new Error('ENOTFOUND');
    });

    expect(result).toMatchObject({ ok: false, terminal: false });
  });

  it('rejects a url that cannot be parsed as terminal', async () => {
    expect(await checkDeliveryUrl('not a url', PUBLIC)).toMatchObject({
      ok: false,
      terminal: true,
    });
  });
});
