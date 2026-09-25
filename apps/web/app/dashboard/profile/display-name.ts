// supabase types user_metadata as an open record, so the name is narrowed here rather than trusted
export function readDisplayName(metadata: object): string | null {
  const name = 'full_name' in metadata ? metadata.full_name : null;
  return typeof name === 'string' && name.trim() !== '' ? name.trim() : null;
}
