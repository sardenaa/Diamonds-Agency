import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '../lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

export type UserRole = 'guest' | 'customer' | 'admin';

interface AuthContextType {
  role: UserRole;
  setRole: React.Dispatch<React.SetStateAction<UserRole>>;
  isAdminVerified: boolean;
  setIsAdminVerified: (verified: boolean) => void;
  adminPermissionTier: string;
  setAdminPermissionTier: (tier: string) => void;
  logoutAdmin: () => void;
  verifyAdmin: (tier: string) => void;
  customerUser: { name: string; email: string; phone: string; nationality: string; language: string; biography?: string } | null;
  setCustomerUser: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; nationality: string; language: string; biography?: string } | null>>;
  logoutCustomer: () => Promise<void>;
  isCheckingCustomerSession: boolean;
  customerAuthView: 'login' | 'register' | 'forgot';
  setCustomerAuthView: React.Dispatch<React.SetStateAction<'login' | 'register' | 'forgot'>>;
  fetchSecurityQuestion: (email: string) => Promise<{ success: boolean; securityQuestion?: string; message?: string }>;
  resetPassword: (email: string, securityAnswer: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('mas_user_role') as UserRole;
    return savedRole || 'guest';
  });
  const [isAdminVerified, setIsAdminVerifiedState] = useState<boolean>(() => {
    return localStorage.getItem('mas_admin_verified') === 'true';
  });
  const [adminPermissionTier, setAdminPermissionTierState] = useState<string>(() => {
    return localStorage.getItem('mas_admin_tier') || 'Sovereign Admin';
  });

  const [customerUser, setCustomerUser] = useState<{ name: string; email: string; phone: string; nationality: string; language: string; biography?: string } | null>(() => {
    const savedUser = localStorage.getItem('mas_customer_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isCheckingCustomerSession, setIsCheckingCustomerSession] = useState<boolean>(true);
  const [customerAuthView, setCustomerAuthView] = useState<'login' | 'register' | 'forgot'>('login');

  // Persist user state whenever they change
  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('mas_customer_user', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('mas_customer_user');
    }
  }, [customerUser]);

  useEffect(() => {
    localStorage.setItem('mas_user_role', role);
  }, [role]);

  // Check active customer session on load (incorporating Firebase state validation)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const checkCustomerSession = async () => {
      try {
        setIsCheckingCustomerSession(true);
        const res = await fetch('/api/auth/validate-session');
        const data = await res.json();
        if (data.valid) {
          setCustomerUser(data.user);
          setRole('customer');
          setIsCheckingCustomerSession(false);
          return;
        }
      } catch (err) {
        console.error('Customer session check failed:', err);
      }

      // Check Firebase Auth state
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const email = firebaseUser.email || '';
          setCustomerUser({
            name: firebaseUser.displayName || email.split('@')[0] || 'Sovereign Guest',
            email: email,
            phone: firebaseUser.phoneNumber || '',
            nationality: 'United States',
            language: 'en',
            biography: 'Sovereign Traveler'
          });
          setRole('customer');
        } else {
          // If no session exists, only clear state if there wasn't a manual local user
          const savedUser = localStorage.getItem('mas_customer_user');
          if (!savedUser) {
            setCustomerUser(null);
            if (role === 'customer') {
              setRole('guest');
            }
          }
        }
        setIsCheckingCustomerSession(false);
      });
    };
    
    checkCustomerSession();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Automatically validate cookie session with the backend on boot & change
  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await fetch('/api/admin/validate-session');
        const data = await res.json();
        if (data.valid) {
          setIsAdminVerifiedState(true);
          setAdminPermissionTierState(data.tier);
          localStorage.setItem('mas_admin_verified', 'true');
          localStorage.setItem('mas_admin_tier', data.tier);
        } else {
          setIsAdminVerifiedState(false);
          localStorage.removeItem('mas_admin_verified');
          localStorage.removeItem('mas_admin_tier');
        }
      } catch (err) {
        console.error('Sovereign Auth check failed:', err);
      }
    };

    validateSession();
  }, [role]);

  const setIsAdminVerified = (verified: boolean) => {
    setIsAdminVerifiedState(verified);
    if (verified) {
      localStorage.setItem('mas_admin_verified', 'true');
    } else {
      localStorage.removeItem('mas_admin_verified');
    }
  };

  const setAdminPermissionTier = (tier: string) => {
    setAdminPermissionTierState(tier);
    localStorage.setItem('mas_admin_tier', tier);
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setIsAdminVerifiedState(false);
    setRole('guest');
    setAdminPermissionTierState('Sovereign Admin');
    localStorage.removeItem('mas_admin_verified');
    localStorage.removeItem('mas_admin_tier');
  };

  const verifyAdmin = (tier: string) => {
    setIsAdminVerifiedState(true);
    setAdminPermissionTierState(tier);
    localStorage.setItem('mas_admin_verified', 'true');
    localStorage.setItem('mas_admin_tier', tier);
  };

  const logoutCustomer = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Customer logout failed:', err);
    }
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Firebase signout failed:', err);
    }
    setCustomerUser(null);
    setRole('guest');
    localStorage.removeItem('mas_customer_user');
    localStorage.setItem('mas_user_role', 'guest');
  };

  const fetchSecurityQuestion = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/security-question?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, securityQuestion: data.securityQuestion };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to connect to server.' };
    }
  };

  const resetPassword = async (email: string, securityAnswer: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityAnswer, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to connect to server.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        isAdminVerified,
        setIsAdminVerified,
        adminPermissionTier,
        setAdminPermissionTier,
        logoutAdmin,
        verifyAdmin,
        customerUser,
        setCustomerUser,
        logoutCustomer,
        isCheckingCustomerSession,
        customerAuthView,
        setCustomerAuthView,
        fetchSecurityQuestion,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
