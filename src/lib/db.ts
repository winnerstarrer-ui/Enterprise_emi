import Dexie from 'dexie';

export interface Owner {
  id?: number;
  firebaseUid: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface Agent {
  id?: number;
  ownerId: string; // Firebase UID of owner
  phone: string;
  pinHash: string;
  name: string;
  assignedVillages: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Village {
  id?: number;
  ownerId: string;
  name: string;
  agentIds?: number[];
  createdAt: Date;
}

export interface Customer {
  id?: number;
  ownerId: string;
  villageId: number;
  customerNumber: number; // unique within village
  name: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id?: number;
  ownerId: string;
  name: string;
  createdAt: Date;
}

export interface Sale {
  id?: number;
  ownerId: string;
  villageId: number;
  customerId: number;
  productId: number;
  downPayment: number;
  emiAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  totalEMIs: number;
  emisCollected: number;
  startDate: Date;
  nextDueDate: Date;
  status: 'active' | 'completed' | 'defaulted';
  assignedAgentId?: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus?: 'pending' | 'synced';
}

export interface Payment {
  id?: number;
  ownerId: string;
  saleId: number;
  amount: number;
  collectedByAgentId: number;
  collectedAt: Date;
  syncStatus?: 'pending' | 'synced';
  createdAt: Date;
}

export class EnterpriseDB extends Dexie {
  owners!: Dexie.Table<Owner, number>;
  agents!: Dexie.Table<Agent, number>;
  villages!: Dexie.Table<Village, number>;
  customers!: Dexie.Table<Customer, number>;
  products!: Dexie.Table<Product, number>;
  sales!: Dexie.Table<Sale, number>;
  payments!: Dexie.Table<Payment, number>;

  constructor() {
    super('EnterpriseDB');
    this.version(1).stores({
      owners: '++id, firebaseUid, email',
      agents: '++id, ownerId, phone',
      villages: '++id, ownerId, name',
      customers: '++id, ownerId, villageId, customerNumber',
      products: '++id, ownerId, name',
      sales: '++id, ownerId, villageId, customerId, status, nextDueDate, syncStatus',
      payments: '++id, ownerId, saleId, collectedAt, syncStatus',
    });
  }
}

export const db = new EnterpriseDB();