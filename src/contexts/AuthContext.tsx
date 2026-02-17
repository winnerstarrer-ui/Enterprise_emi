import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db, Agent } from '@/lib/db';
import { hashPin } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  ownerLogin: (email: string, password: string) => Promise<void>;
  agentLogin: (phone: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  agent: Agent | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored agent session
    const storedAgent = sessionStorage.getItem('agent');
    if (storedAgent) {
      setAgent(JSON.parse(storedAgent));
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const ownerLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const agentLogin = async (phone: string, pin: string) => {
    const agentRecord = await db.agents.where('phone').equals(phone).first();
    if (!agentRecord) return false;
    const hashedPin = hashPin(pin);
    if (agentRecord.pinHash !== hashedPin) return false;

    // Check if local data exists for this agent's villages
    const villages = agentRecord.assignedVillages;
    let hasData = false;
    if (villages.length > 0) {
      const customers = await db.customers.where('villageId').anyOf(villages).count();
      hasData = customers > 0;
    }

    // Store agent in session
    sessionStorage.setItem('agent', JSON.stringify(agentRecord));
    setAgent(agentRecord);

    // If no local data, redirect to import page (handled in component)
    return true;
  };

  const logout = async () => {
    if (user) {
      await signOut(auth);
    }
    sessionStorage.removeItem('agent');
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, ownerLogin, agentLogin, logout, agent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);