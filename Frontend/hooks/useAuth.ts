import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string) => {
    console.log('Storing token in localStorage:', token.substring(0, 20) + '...');
    
    localStorage.setItem('accessToken', token);
    setIsAuthenticated(true);
    
    // Dispatch custom event to notify UserContext
    window.dispatchEvent(new CustomEvent('userLogin', { detail: { token } }));
    
    console.log('Token stored, authentication set to true');
  };

  const logout = () => {
    console.log('Logging out - clearing token and user data');
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    
    // Clear user data from UserContext
    if ((window as any).clearUserData) {
      (window as any).clearUserData();
    }
    
    router.push('/login');
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  };

  const redirectIfAuthenticated = () => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
    redirectIfAuthenticated
  };
};
