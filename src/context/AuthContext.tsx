import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/ecommerce';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (fullName: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'gem_crystal_user';

const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@gemandcrystal.co.ke',
  fullName: 'Gem & Crystal Admin',
  phone: '+254 718 796 296',
  role: 'admin',
  savedAddresses: [
    {
      id: 'addr-admin',
      fullName: 'Gem & Crystal Admin',
      phone: '+254 718 796 296',
      county: 'Nairobi',
      townCity: 'Nairobi CBD',
      streetAddress: 'Gem & Crystal Flagship Store, Kimathi Street',
      isDefault: true,
    }
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
};

const DEMO_CUSTOMER: UserProfile = {
  id: 'usr-cust-01',
  email: 'jane.wambui@gmail.com',
  fullName: 'Jane Wambui',
  phone: '+254 712 345 678',
  role: 'customer',
  savedAddresses: [
    {
      id: 'addr-01',
      fullName: 'Jane Wambui',
      phone: '+254 712 345 678',
      county: 'Nairobi',
      townCity: 'Kilimani',
      streetAddress: 'Rose Avenue, Apt 4B',
      isDefault: true,
    }
  ],
  createdAt: '2025-02-15T00:00:00.000Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEMO_CUSTOMER; // default logged in as customer for seamless UI testing
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin@gemandcrystal.co.ke' || cleanEmail.includes('admin')) {
      setUser(DEMO_ADMIN);
      setIsAuthModalOpen(false);
      return { success: true, message: 'Welcome back, Admin!' };
    }

    const customerUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0].toUpperCase(),
      phone: '+254 7' + Math.floor(10000000 + Math.random() * 90000000),
      role: 'customer',
      savedAddresses: [
        {
          id: 'addr-' + Date.now(),
          fullName: cleanEmail.split('@')[0],
          phone: '+254 712 345 678',
          county: 'Nairobi',
          townCity: 'Westlands',
          streetAddress: 'Waiyaki Way',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    setUser(customerUser);
    setIsAuthModalOpen(false);
    return { success: true, message: 'Login successful!' };
  };

  const register = async (
    fullName: string,
    email: string,
    phone: string
  ): Promise<{ success: boolean; message: string }> => {
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email: email.toLowerCase().trim(),
      fullName,
      phone,
      role: 'customer',
      savedAddresses: [
        {
          id: 'addr-' + Date.now(),
          fullName,
          phone,
          county: 'Nairobi',
          townCity: 'Nairobi',
          streetAddress: 'Main Delivery Address',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    return { success: true, message: 'Account created successfully! Welcome to Gem & Crystal.' };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isAuthModalOpen,
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components -- Provider hook is intentionally colocated.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
