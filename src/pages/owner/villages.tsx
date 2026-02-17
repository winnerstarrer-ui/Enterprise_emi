import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, Village } from '@/lib/db';
import toast from 'react-hot-toast';

export default function VillagesPage() {
  const { user } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;
    loadVillages();
  }, [user]);

  const loadVillages = async () => {
    const ownerId = user!.uid;
    setVillages(await db.villages.where('ownerId').equals(ownerId).toArray());
  };

  const addVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ownerId = user!.uid;
    await db.villages.add({
      ownerId,
      name: newName,
      createdAt: new Date(),
    });
    toast.success('Village added');
    setNewName('');
    loadVillages();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Villages</h1>
      <form onSubmit={addVillage} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Village name"
          className="border p-2 flex-1 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {villages.map((v) => (
          <li key={v.id} className="bg-white p-3 rounded shadow">
            {v.name}
          </li>
        ))}
      </ul>
    </div>
  );
}