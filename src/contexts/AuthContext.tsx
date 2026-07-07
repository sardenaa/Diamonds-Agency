import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const logoutAdmin = () => {
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
