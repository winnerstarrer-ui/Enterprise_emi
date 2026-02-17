import { db } from './db';
import { db as firestoreDb } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export async function syncLocalToRemote(ownerId: string) {
  // Sync sales
  const unsyncedSales = await db.sales.where('syncStatus').equals('pending').toArray();
  for (const sale of unsyncedSales) {
    const saleRef = doc(firestoreDb, 'owners', ownerId, 'sales', sale.id!.toString());
    await setDoc(saleRef, {
      ...sale,
      id: undefined,
      createdAt: Timestamp.fromDate(sale.createdAt),
      updatedAt: Timestamp.fromDate(sale.updatedAt || new Date()),
    });
    await db.sales.update(sale.id!, { syncStatus: 'synced' });
  }

  // Sync payments
  const unsyncedPayments = await db.payments.where('syncStatus').equals('pending').toArray();
  for (const payment of unsyncedPayments) {
    const paymentRef = doc(firestoreDb, 'owners', ownerId, 'payments', payment.id!.toString());
    await setDoc(paymentRef, {
      ...payment,
      id: undefined,
      collectedAt: Timestamp.fromDate(payment.collectedAt),
      createdAt: Timestamp.fromDate(payment.createdAt),
    });
    await db.payments.update(payment.id!, { syncStatus: 'synced' });
  }
}

export async function syncRemoteToLocal(ownerId: string) {
  // Pull sales
  const salesQuery = query(collection(firestoreDb, 'owners', ownerId, 'sales'));
  const salesSnapshot = await getDocs(salesQuery);
  for (const docSnap of salesSnapshot.docs) {
    const data = docSnap.data();
    await db.sales.put({
      ...data,
      id: parseInt(docSnap.id),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      syncStatus: 'synced',
    } as any);
  }

  // Pull payments
  const paymentsQuery = query(collection(firestoreDb, 'owners', ownerId, 'payments'));
  const paymentsSnapshot = await getDocs(paymentsQuery);
  for (const docSnap of paymentsSnapshot.docs) {
    const data = docSnap.data();
    await db.payments.put({
      ...data,
      id: parseInt(docSnap.id),
      collectedAt: data.collectedAt.toDate(),
      createdAt: data.createdAt.toDate(),
      syncStatus: 'synced',
    } as any);
  }

  // Pull villages
  const villagesQuery = query(collection(firestoreDb, 'owners', ownerId, 'villages'));
  const villagesSnapshot = await getDocs(villagesQuery);
  for (const docSnap of villagesSnapshot.docs) {
    const data = docSnap.data();
    await db.villages.put({
      ...data,
      id: parseInt(docSnap.id),
      createdAt: data.createdAt.toDate(),
    } as any);
  }

  // Pull customers
  const customersQuery = query(collection(firestoreDb, 'owners', ownerId, 'customers'));
  const customersSnapshot = await getDocs(customersQuery);
  for (const docSnap of customersSnapshot.docs) {
    const data = docSnap.data();
    await db.customers.put({
      ...data,
      id: parseInt(docSnap.id),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as any);
  }

  // Pull products
  const productsQuery = query(collection(firestoreDb, 'owners', ownerId, 'products'));
  const productsSnapshot = await getDocs(productsQuery);
  for (const docSnap of productsSnapshot.docs) {
    const data = docSnap.data();
    await db.products.put({
      ...data,
      id: parseInt(docSnap.id),
      createdAt: data.createdAt.toDate(),
    } as any);
  }

  // Pull agents
  const agentsQuery = query(collection(firestoreDb, 'owners', ownerId, 'agents'));
  const agentsSnapshot = await getDocs(agentsQuery);
  for (const docSnap of agentsSnapshot.docs) {
    const data = docSnap.data();
    await db.agents.put({
      ...data,
      id: parseInt(docSnap.id),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as any);
  }
}