import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api } from '@/services/api';
import { clearSession, readSession, saveSession } from '@/services/session';
import type { MarketUser, Session, UserRole } from '@/types/market';

type AuthContextValue = {
  user: MarketUser | null;
  ready: boolean;
  signIn: (emailOrPhone: string, password: string) => Promise<void>;
  signUp: (details: { name: string; emailOrPhone: string; password: string; role: UserRole }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MarketUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readSession().then((session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
  }, []);

  async function acceptSession(session: Session) {
    await saveSession(session);
    setUser(session.user);
  }

  async function signIn(emailOrPhone: string, password: string) {
    await acceptSession(await api.login({ emailOrPhone, password }));
  }

  async function signUp(details: { name: string; emailOrPhone: string; password: string; role: UserRole }) {
    await acceptSession(await api.register(details));
  }

  async function signOut() {
    await clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}