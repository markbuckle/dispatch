// lowercased, because DNS names are case-insensitive and a domain is stored lowercase when it is added
export function senderDomain(address: string): string {
  return address.slice(address.lastIndexOf('@') + 1).toLowerCase();
}
