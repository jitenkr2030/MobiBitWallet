"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { merchantAuthService, type MerchantUser } from "@/lib/merchant-auth-service";

interface User {
  id: string;
  email: string;
  name: string;
  isMerchant?: boolean;
  merchantUser?: MerchantUser;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  getSecurityMetrics: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage or cookie)
    const savedUser = localStorage.getItem('mobbitwallet_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('mobbitwallet_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try merchant authentication first
      const deviceInfo = {
        deviceId: `device_${Date.now()}`,
        deviceType: 'desktop' as const,
        deviceName: 'Web Browser',
        userAgent: navigator.userAgent,
        ipAddress: '127.0.0.1' // In real app, this would be detected
      };

      const authResult = await merchantAuthService.authenticateMerchant(email, password, deviceInfo);
      
      if (authResult.success && authResult.user) {
        const user: User = {
          id: authResult.user.id,
          email: authResult.user.email,
          name: authResult.user.name,
          isMerchant: true,
          merchantUser: authResult.user
        };
        
        setUser(user);
        localStorage.setItem('mobbitwallet_user', JSON.stringify(user));
        return true;
      }

      // Fallback to basic authentication for non-merchant users
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 6) {
        const basicUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          isMerchant: email.includes('merchant') || email.includes('business')
        };
        
        setUser(basicUser);
        localStorage.setItem('mobbitwallet_user', JSON.stringify(basicUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Check if this should be a merchant account
      const isMerchant = email.includes('merchant') || email.includes('business');
      
      if (isMerchant) {
        const merchantUser = await merchantAuthService.createMerchantUser({
          email,
          name,
          password,
          roles: ['owner'],
          merchantProfile: {
            businessName: `${name}'s Business`,
            businessType: 'llc',
            businessCategory: 'other',
            monthlyVolume: 'under_10k',
            supportedCurrencies: ['USD'],
            address: {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'US'
            }
          }
        });

        const user: User = {
          id: merchantUser.id,
          email: merchantUser.email,
          name: merchantUser.name,
          isMerchant: true,
          merchantUser: merchantUser
        };
        
        setUser(user);
        localStorage.setItem('mobbitwallet_user', JSON.stringify(user));
        return true;
      }

      // Basic user registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 6 && name) {
        const basicUser: User = {
          id: Date.now().toString(),
          email,
          name,
          isMerchant: false
        };
        
        setUser(basicUser);
        localStorage.setItem('mobbitwallet_user', JSON.stringify(basicUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mobbitwallet_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.merchantUser) return false;
    return merchantAuthService.hasPermission(user.merchantUser, permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user?.merchantUser) return false;
    return merchantAuthService.hasAnyRole(user.merchantUser, [role as any]);
  };

  const getSecurityMetrics = () => {
    if (!user?.merchantUser) return null;
    return merchantAuthService.getSecurityMetrics(user.merchantUser.id);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      hasPermission, 
      hasRole,
      getSecurityMetrics 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}