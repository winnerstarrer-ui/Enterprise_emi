import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, Agent, Village } from '@/lib/db';
import { hashPin } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pin: '',
    assignedVillages: [] as number[],
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const ownerId = user!.uid;
    setAgents(await db.agents.where('ownerId').equals(ownerId).toArray());
    setVillages(await db.villages.where('ownerId').equals(ownerId).toArray());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ownerId = user!.uid;
    const newAgent: Omit<Agent, 'id'> = {
      ownerId,
      name: form.name,
      phone: form.phone,
      pinHash: hashPin(form.pin),
      assignedVillages: form.assignedVillages,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.agents.add(newAgent);
    toast.success('Agent added');
    setShowForm(false);
    setForm({ name: '', phone: '', pin: '', assignedVillages: [] });
    loadData();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Agents</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        {showForm ? 'Cancel' : 'Add New Agent'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3 max-w-md">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">PIN (4-6 digits)</label>
            <input
              type="password"
              maxLength={6}
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Assigned Villages</label>
            <select
              multiple
              value={form.assignedVillages.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value));
                setForm({ ...form, assignedVillages: selected });
              }}
              className="border p-2 w-full rounded h-32"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Hold Ctrl to select multiple</p>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Save Agent
          </button>
        </form>
      )}

      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white p-4 rounded shadow">
            <p><strong>{agent.name}</strong> ({agent.phone})</p>
            <p>Assigned Villages: {agent.assignedVillages.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}