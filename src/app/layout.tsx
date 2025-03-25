import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContractProvider } from '@/contexts/ContractContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FourierFi - Harmonic Trading Platform',
  description: 'A decentralized trading platform powered by Fourier analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <ContractProvider>
              <SettingsProvider>
                <ThemeProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
                </ThemeProvider>
              </SettingsProvider>
            </ContractProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 