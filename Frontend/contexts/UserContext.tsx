'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { requestInstance } from '@/request';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: number;
  is_active: boolean;
  is_delete: boolean;
  created_on: string;
  user_id: number;
  referral_amount?: number;
  specialization?: string;
  experience?: string;
  qualification?: string;
  clinic_name?: string;
  clinic_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (userData: User) => void;
  clearUser: () => void;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false); // Prevent multiple simultaneous calls

  const fetchUserData = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      return;
    }
    
    try {
      setIsFetching(true);
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }

      // Try to fetch from API
      try {
        const userData = await requestInstance.getUserProfile();
        
        if (userData && userData.is_success && userData.data) {
          setUser(userData.data);
        } else {
          setUser(null);
        }
      } catch (apiError: any) {
        if (apiError?.response?.status === 401) {
          localStorage.removeItem('accessToken');
        }
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const clearUser = () => {
    setUser(null);
  };

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserData();
    } else {
      // Clear user data if no token
      setUser(null);
    }
  }, []);

  // Listen for authentication changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (!token && user) {
        setUser(null);
      }
    };

    // Check auth every 30 seconds (much reduced frequency)
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []); // Remove user dependency to prevent recreation

  // Listen for token changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue === null) {
          // Token removed - clear user data
          setUser(null);
        } else if (e.newValue && !user) {
          // Token added - fetch user data
          fetchUserData();
        }
      }
    };

    const handleUserLogin = (e: CustomEvent) => {
      console.log('User login event received, fetching user data');
      fetchUserData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('userLogin', handleUserLogin as EventListener);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userLogin', handleUserLogin as EventListener);
      };
    }
  }, [user]);

  const value: UserContextType = {
    user,
    isLoading,
    error,
    updateUser,
    clearUser,
    fetchUserData,
  };

  // Expose clearUser globally for logout (only in browser)
  if (typeof window !== 'undefined') {
    (window as any).clearUserData = clearUser;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
