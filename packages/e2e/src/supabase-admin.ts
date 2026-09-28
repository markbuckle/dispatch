function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} is not set. CLAUDE.md, End-to-end tests, lists what the suite needs.`);
  return value;
}

function adminRequest(path: string, init: RequestInit): Promise<Response> {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  return fetch(`${url}/auth/v1/admin/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });
}

export function readUserId(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'id' in body && typeof body.id === 'string') {
    return body.id;
  }
  throw new Error('Expected an object with a string id.');
}

// confirmed at creation, because production keeps email confirmation on and a signup would wait on an inbox
export async function createConfirmedUser(email: string, password: string): Promise<string> {
  const response = await adminRequest('users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!response.ok) {
    throw new Error(`Creating the test user failed: ${response.status} ${await response.text()}`);
  }
  return readUserId(await response.json());
}

export async function deleteUser(id: string): Promise<void> {
  const response = await adminRequest(`users/${id}`, { method: 'DELETE' });
  // a 404 means an earlier teardown already got it
  if (!response.ok && response.status !== 404) {
    throw new Error(`Deleting test user ${id} failed: ${response.status} ${await response.text()}`);
  }
}
