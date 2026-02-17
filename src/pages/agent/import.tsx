import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { syncRemoteToLocal } from '@/lib/sync';
import toast from 'react-hot-toast';

export default function AgentImport() {
  const { agent } = useAuth();
  const router = useRouter();
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!agent) router.push('/login/agent');
  }, [agent]);

  const handleImport = async () => {
    if (!agent) return;
    setImporting(true);
    toast.loading('Importing data...', { id: 'import' });
    try {
      await syncRemoteToLocal(agent.ownerId);
      toast.success('Import complete', { id: 'import' });
      router.push('/agent/villages');
    } catch (error) {
      toast.error('Import failed', { id: 'import' });
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">First Time Login</h1>
        <p className="mb-6">
          It looks like this device doesn't have your assigned data yet.
          You can import it now from the cloud backup.
        </p>
        <button
          onClick={handleImport}
          disabled={importing}
          className="bg-blue-600 text-white px-6 py-3 rounded w-full disabled:bg-gray-400"
        >
          {importing ? 'Importing...' : 'Import My Data'}
        </button>
        {!navigator.onLine && (
          <p className="mt-4 text-red-600">
            You are offline. Please connect to the internet to import.
          </p>
        )}
      </div>
    </div>
  );
}