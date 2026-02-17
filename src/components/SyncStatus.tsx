import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { syncLocalToRemote, syncRemoteToLocal } from '@/lib/sync';
import { db } from '@/lib/db';
import toast from 'react-hot-toast';

export default function SyncStatus() {
  const { user, agent } = useAuth();
  const [status, setStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!user && !agent) return;
    const checkPending = async () => {
      const ownerId = user?.uid || agent?.ownerId;
      if (!ownerId) return;
      const pendingSales = await db.sales.where({ ownerId, syncStatus: 'pending' }).count();
      const pendingPayments = await db.payments.where({ ownerId, syncStatus: 'pending' }).count();
      setPending(pendingSales + pendingPayments);
      setStatus(navigator.onLine ? (pending > 0 ? 'syncing' : 'synced') : 'offline');
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [user, agent]);

  const sync = async () => {
    const ownerId = user?.uid || agent?.ownerId;
    if (!ownerId || !navigator.onLine) return;
    setStatus('syncing');
    toast.loading('Syncing...', { id: 'sync' });
    await syncLocalToRemote(ownerId);
    await syncRemoteToLocal(ownerId);
    setStatus('synced');
    toast.success('Sync complete', { id: 'sync' });
  };

  if (!user && !agent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 flex justify-between items-center text-sm z-50">
      <span>
        {status === 'synced' && '✅ Synced'}
        {status === 'syncing' && '🔄 Syncing...'}
        {status === 'offline' && '⚠️ Offline'}
        {pending > 0 && ` (${pending} pending)`}
      </span>
      {status !== 'synced' && navigator.onLine && (
        <button onClick={sync} className="bg-blue-500 px-2 py-1 rounded">
          Sync Now
        </button>
      )}
    </div>
  );
}