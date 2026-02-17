import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import SyncStatus from '@/components/SyncStatus';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <SyncStatus />
      <Toaster position="bottom-center" />
    </AuthProvider>
  );
}