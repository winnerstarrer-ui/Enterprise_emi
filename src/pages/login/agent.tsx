import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function AgentLogin() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const { agentLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await agentLogin(phone, pin);
    if (success) {
      // Check if we need to import
      const agent = JSON.parse(sessionStorage.getItem('agent')!);
      const villages = agent.assignedVillages;
      // We'll redirect to villages; import check will happen there
      router.push('/agent/villages');
    } else {
      toast.error('Invalid phone or PIN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Agent Login</h1>
        <div className="mb-4">
          <label className="block mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">4-6 Digit PIN</label>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}