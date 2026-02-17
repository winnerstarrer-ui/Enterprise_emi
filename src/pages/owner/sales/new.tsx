import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { db, Village, Customer, Product, Agent, Sale } from '@/lib/db';
import { generateCustomerNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NewSale() {
  const { user } = useAuth();
  const router = useRouter();
  const [villages, setVillages] = useState<Village[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({
    villageId: '',
    customerId: '',
    newCustomerName: '',
    newCustomerPhone: '',
    productId: '',
    downPayment: 0,
    emiAmount: 0,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    totalEMIs: 1,
    assignedAgentId: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user) router.push('/');
    else loadData();
  }, [user]);

  const loadData = async () => {
    const ownerId = user!.uid;
    setVillages(await db.villages.where('ownerId').equals(ownerId).toArray());
    setProducts(await db.products.where('ownerId').equals(ownerId).toArray());
    setAgents(await db.agents.where('ownerId').equals(ownerId).toArray());
  };

  useEffect(() => {
    if (form.villageId) {
      db.customers
        .where({ ownerId: user!.uid, villageId: parseInt(form.villageId) })
        .toArray()
        .then(setCustomers);
    } else {
      setCustomers([]);
    }
  }, [form.villageId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ownerId = user!.uid;
    const villageId = parseInt(form.villageId);
    let customerId: number;

    if (form.customerId === 'new') {
      const customerNumber = await generateCustomerNumber(ownerId, villageId);
      const newCustomer: Omit<Customer, 'id'> = {
        ownerId,
        villageId,
        customerNumber,
        name: form.newCustomerName,
        phone: form.newCustomerPhone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      customerId = await db.customers.add(newCustomer);
    } else {
      customerId = parseInt(form.customerId);
    }

    const startDate = new Date(form.startDate);
    const nextDueDate = new Date(startDate);
    if (form.frequency === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
    else if (form.frequency === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
    else nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const sale: Omit<Sale, 'id'> = {
      ownerId,
      villageId,
      customerId,
      productId: parseInt(form.productId),
      downPayment: form.downPayment,
      emiAmount: form.emiAmount,
      frequency: form.frequency,
      totalEMIs: form.totalEMIs,
      emisCollected: 0,
      startDate,
      nextDueDate,
      status: 'active',
      assignedAgentId: form.assignedAgentId ? parseInt(form.assignedAgentId) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
    };

    await db.sales.add(sale);
    toast.success('Sale created');
    router.push('/owner/dashboard');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">New Sale</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Village</label>
          <select
            value={form.villageId}
            onChange={(e) => setForm({ ...form, villageId: e.target.value, customerId: '' })}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select village</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Customer</label>
          <select
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select existing customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customerNumber} - {c.name}
              </option>
            ))}
            <option value="new">+ Add new customer</option>
          </select>
        </div>

        {form.customerId === 'new' && (
          <>
            <div>
              <label className="block mb-1">New Customer Name</label>
              <input
                type="text"
                value={form.newCustomerName}
                onChange={(e) => setForm({ ...form, newCustomerName: e.target.value })}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={form.newCustomerPhone}
                onChange={(e) => setForm({ ...form, newCustomerPhone: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>
          </>
        )}

        <div>
          <label className="block mb-1">Product</label>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Down Payment (₹)</label>
          <input
            type="number"
            value={form.downPayment}
            onChange={(e) => setForm({ ...form, downPayment: parseInt(e.target.value) })}
            className="border p-2 w-full rounded"
            min="0"
          />
        </div>

        <div>
          <label className="block mb-1">EMI Amount (₹)</label>
          <input
            type="number"
            value={form.emiAmount}
            onChange={(e) => setForm({ ...form, emiAmount: parseInt(e.target.value) })}
            className="border p-2 w-full rounded"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block mb-1">Frequency</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
            className="border p-2 w-full rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Total Number of EMIs</label>
          <input
            type="number"
            value={form.totalEMIs}
            onChange={(e) => setForm({ ...form, totalEMIs: parseInt(e.target.value) })}
            className="border p-2 w-full rounded"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block mb-1">Assign to Agent (optional)</label>
          <select
            value={form.assignedAgentId}
            onChange={(e) => setForm({ ...form, assignedAgentId: e.target.value })}
            className="border p-2 w-full rounded"
          >
            <option value="">None</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Create Sale
        </button>
      </form>
    </div>
  );
}