import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('guest');
  const [isAdminVerified, setIsAdminVerifiedState] = useState<boolean>(() => {
    return localStorage.getItem('mas_admin_verified') === 'true';
  });
  const [adminPermissionTier, setAdminPermissionTierState] = useState<string>(() => {
    return localStorage.getItem('mas_admin_tier') || 'Sovereign Admin';
  });

  const [customerUser, setCustomerUser] = useState<{ name: string; email: string; phone: string; nationality: string; language: string; biography?: string } | null>(null);
  const [isCheckingCustomerSession, setIsCheckingCustomerSession] = useState<boolean>(true);
  const [customerAuthView, setCustomerAuthView] = useState<'login' | 'register' | 'forgot'>('login');

  // Check active customer session on load
  useEffect(() => {
    const checkCustomerSession = async () => {
      try {
        setIsCheckingCustomerSession(true);
        const res = await fetch('/api/auth/validate-session');
        const data = await res.json();
        if (data.valid) {
          setCustomerUser(data.user);
          setRole('customer');
        } else {
          setCustomerUser(null);
        }
      } catch (err) {
        console.error('Customer session check failed:', err);
      } finally {
        setIsCheckingCustomerSession(false);
      }
    };
    checkCustomerSession();
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
    setCustomerUser(null);
    setRole('guest');
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
