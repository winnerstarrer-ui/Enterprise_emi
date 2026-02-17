import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { db, Village } from '@/lib/db';
import { syncRemoteToLocal } from '@/lib/sync';
import toast from 'react-hot-toast';

export default function AgentVillages() {
  const { agent, logout } = useAuth();
  const router = useRouter();
  const [villages, setVillages] = useState<(Village & { dueAmount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agent) {
      router.push('/login/agent');
      return;
    }
    checkDataAndLoad();
  }, [agent]);

  const checkDataAndLoad = async () => {
    if (!agent) return;
    const customers = await db.customers
      .where('villageId')
      .anyOf(agent.assignedVillages)
      .count();
    if (customers === 0 && navigator.onLine) {
      toast.loading('Importing your data...', { id: 'import' });
      await syncRemoteToLocal(agent.ownerId);
      toast.success('Data imported', { id: 'import' });
    }
    loadVillages();
  };

  const loadVillages = async () => {
    if (!agent) return;
    const villageList = await db.villages.where('id').anyOf(agent.assignedVillages).toArray();
    const withDue = await Promise.all(
      villageList.map(async (v) => {
        const sales = await db.sales
          .where({ villageId: v.id, status: 'active' })
          .toArray();
        const due = sales.reduce((sum, s) => {
          if (new Date(s.nextDueDate) <= new Date()) sum += s.emiAmount;
          return sum;
        }, 0);
        return { ...v, dueAmount: due };
      })
    );
    setVillages(withDue);
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Select Village</h1>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
          Logout
        </button>
      </div>
      <div className="space-y-3">
        {villages.map((v) => (
          <button
            key={v.id}
            onClick={() => router.push(`/agent/collect/${v.id}`)}
            className="w-full bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <span className="text-lg">{v.name}</span>
            <span className="text-red-600 font-semibold">Due: ₹{v.dueAmount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}