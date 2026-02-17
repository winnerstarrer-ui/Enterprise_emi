import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, agent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/owner/dashboard');
    else if (agent) router.push('/agent/villages');
  }, [user, agent, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Enterprise EMI</h1>
        <div className="space-y-4">
          <Link href="/login/owner" className="block w-full text-center bg-blue-600 text-white py-2 rounded">
            Owner Login
          </Link>
          <Link href="/login/agent" className="block w-full text-center bg-green-600 text-white py-2 rounded">
            Agent Login
          </Link>
        </div>
      </div>
    </div>
  );
}