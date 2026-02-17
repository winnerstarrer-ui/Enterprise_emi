import { db } from './db';

export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

export async function generateCustomerNumber(ownerId: string, villageId: number): Promise<number> {
  const customers = await db.customers.where({ ownerId, villageId }).toArray();
  const max = customers.reduce((max, c) => Math.max(max, c.customerNumber), 0);
  return max + 1;
}