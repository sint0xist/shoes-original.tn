import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRIMARY_ADMIN_EMAIL = 'amineadem@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const checkAdminStatus = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) return false;

    const isPrimaryAdmin = currentUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

    try {
      const adminDocRef = doc(db, 'admins', currentUser.uid);

      if (isPrimaryAdmin) {
        // Automatically ensure primary admin record exists in Firestore
        await setDoc(
          adminDocRef,
          {
            role: 'admin',
            email: currentUser.email,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        ).catch((err) => console.warn('Primary admin doc sync warning:', err));
        return true;
      }

      // Check if user's UID exists in /admins collection
      const adminSnap = await getDoc(adminDocRef);
      return adminSnap.exists();
    } catch (error) {
      console.warn('Error checking admin document status:', error);
      return isPrimaryAdmin;
    }
  };

  useEffect(() => {
    // Clear legacy demo flags from localStorage if present
    localStorage.removeItem('amino_demo_admin');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminConfirmed = await checkAdminStatus(currentUser);
        setIsAdmin(adminConfirmed);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginAdmin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const adminConfirmed = await checkAdminStatus(cred.user);
      setIsAdmin(adminConfirmed);
      setIsLoginModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const adminConfirmed = await checkAdminStatus(cred.user);
      setIsAdmin(adminConfirmed);
      setIsLoginModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginAdmin,
        loginWithGoogle,
        logoutAdmin,
        isLoginModalOpen,
        setIsLoginModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

