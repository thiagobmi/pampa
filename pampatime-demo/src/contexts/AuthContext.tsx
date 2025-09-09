import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { AppUser } from '@/types/auth';
import { createUserRecord, getUser } from '@/services/userService';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutApp: () => Promise<void>;
  isAdmin: boolean;
  sendReset: (email?: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const record = await getUser(fbUser.uid);
      if (record) {
        if (record.active === false) {
          // se inativo, força logout
          await signOut(auth);
          setUser(null);
        } else {
          setUser(record);
        }
      } else {
        // Caso usuário exista na Auth mas não no DB, criar com defaults mínimos (normalmente admin inicial)
        const newUser: AppUser = { uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, role: 'admin', active: true };
        await createUserRecord(newUser);
        setUser(newUser);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInHandler = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutHandler = async () => {
    await signOut(auth);
  };

  const sendReset = async (email?: string) => {
    const target = email || auth.currentUser?.email;
    if (!target) throw new Error('Email não disponível');
    await sendPasswordResetEmail(auth, target);
  };

  const updateDisplayName = async (name: string) => {
    if (!auth.currentUser) throw new Error('Não autenticado');
    await updateProfile(auth.currentUser, { displayName: name });
    // refaz sync: onAuthStateChanged atualizará displayName, mas podemos refletir local
    setUser(prev => prev ? { ...prev, displayName: name } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn: signInHandler, signOutApp: signOutHandler, isAdmin: user?.role === 'admin', sendReset, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
