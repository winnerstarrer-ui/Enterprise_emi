import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCollections: 0,
    pendingEMIs: 0,
    activeCustomers: 0,
  });

  useEffect(() => {
    if (!user) router.push('/');
    else loadStats();
  }, [user]);

  const loadStats = async () => {
    const ownerId = user?.uid!;
    const payments = await db.payments.where('ownerId').equals(ownerId).toArray();
    const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);
    const activeSales = await db.sales.where({ ownerId, status: 'active' }).count();
    const customers = await db.customers.where('ownerId').equals(ownerId).count();
    setStats({
      totalCollections,
      pendingEMIs: activeSales,
      activeCustomers: customers,
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Link href="/owner/sales/new" className="btn btn-primary btn-block h-auto py-4">
    New Sale
  </Link>
  <Link href="/owner/agents" className="btn btn-secondary btn-block h-auto py-4">
    Manage Agents
  </Link>
  <Link href="/owner/villages" className="btn btn-accent btn-block h-auto py-4">
    Manage Villages
  </Link>
  <Link href="/owner/products" className="btn btn-info btn-block h-auto py-4">
    Manage Products
  </Link>
  <Link href="/owner/reports" className="btn btn-warning btn-block h-auto py-4 col-span-2 md:col-span-1">
    Reports & Export
  </Link>
</div>
    </div>
  );
}