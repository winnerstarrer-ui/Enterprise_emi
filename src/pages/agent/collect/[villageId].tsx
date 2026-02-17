import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, Customer, Sale, Payment } from '@/lib/db';
import toast from 'react-hot-toast';
import Receipt from '@/components/Receipt';

export default function CollectionScreen() {
  const router = useRouter();
  const { villageId } = router.query;
  const { agent } = useAuth();
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [dueAmount, setDueAmount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showReceipt, setShowReceipt] = useState<{
    payment: Payment;
    sale: Sale;
    customer: Customer;
    agent: any;
  } | null>(null);

  useEffect(() => {
    if (!agent) router.push('/login/agent');
    else if (!villageId) return;
    else loadCustomers();
  }, [villageId, agent]);

  const loadCustomers = async () => {
    const custs = await db.customers
      .where('villageId')
      .equals(Number(villageId))
      .toArray();
    setCustomers(custs);
  };

  const handleCustomerIdChange = async (id: string) => {
    setCustomerId(id);
    if (id) {
      const cust = await db.customers
        .where({ villageId: Number(villageId), customerNumber: parseInt(id) })
        .first();
      setCustomer(cust || null);
      if (cust) {
        const sales = await db.sales
          .where({ customerId: cust.id, status: 'active' })
          .toArray();
        const due = sales.reduce((sum, s) => {
          if (new Date(s.nextDueDate) <= new Date()) sum += s.emiAmount;
          return sum;
        }, 0);
        setDueAmount(due);
      } else {
        setDueAmount(0);
      }
    } else {
      setCustomer(null);
      setDueAmount(0);
    }
  };

  const collect = async () => {
    if (!customer || !amount) return toast.error('Enter customer and amount');
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return toast.error('Invalid amount');

    // Find active sale for customer
    const activeSale = await db.sales
      .where({ customerId: customer.id, status: 'active' })
      .first();
    if (!activeSale) return toast.error('No active EMI for this customer');

    // Create payment record
    const payment: Omit<Payment, 'id'> = {
      ownerId: agent!.ownerId,
      saleId: activeSale.id!,
      amount: paymentAmount,
      collectedByAgentId: agent!.id!,
      collectedAt: new Date(),
      syncStatus: 'pending',
      createdAt: new Date(),
    };
    const paymentId = await db.payments.add(payment);

    // Update sale
    activeSale.emisCollected += 1;
    const nextDue = new Date(activeSale.nextDueDate);
    if (activeSale.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
    else if (activeSale.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (activeSale.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
    activeSale.nextDueDate = nextDue;
    if (activeSale.emisCollected >= activeSale.totalEMIs) {
      activeSale.status = 'completed';
    }
    activeSale.updatedAt = new Date();
    await db.sales.update(activeSale.id!, activeSale);

    // Fetch full payment record for receipt
    const fullPayment = await db.payments.get(paymentId);
    if (fullPayment) {
      setShowReceipt({
        payment: fullPayment,
        sale: activeSale,
        customer,
        agent,
      });
    }

    toast.success('Payment recorded');
    setCustomerId('');
    setAmount('');
    setCustomer(null);
    setDueAmount(0);
  };

  if (showReceipt) {
    return (
      <div className="p-4">
        <Receipt {...showReceipt} />
        <button
          onClick={() => setShowReceipt(null)}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
        >
          New Collection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Collect Payment</h1>
      <div className="mb-4">
        <label className="block mb-1">Customer Number</label>
        <input
          type="number"
          value={customerId}
          onChange={(e) => handleCustomerIdChange(e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="Enter numeric ID"
          autoFocus
        />
        {customer && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <p><strong>{customer.name}</strong></p>
            <p>Due: ₹{dueAmount}</p>
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="Enter amount"
        />
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[100, 200, 300, 500, 1000].map((amt) => (
          <button
            key={amt}
            onClick={() => setAmount(amt.toString())}
            className="bg-gray-200 p-2 rounded"
          >
            ₹{amt}
          </button>
        ))}
      </div>
      <button
        onClick={collect}
        className="bg-green-600 text-white w-full py-3 rounded text-lg font-semibold"
      >
        Collect
      </button>
    </div>
  );
}