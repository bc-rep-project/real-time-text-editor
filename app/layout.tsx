import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Collaborative Text Editor',
  description: 'Real-time collaborative text editor with chat and version control',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Navigation />
              <main className="min-h-screen">
                {children}
              </main>
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 