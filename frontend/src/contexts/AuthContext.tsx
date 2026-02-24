import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/api';

export type UserRole = 'admin' | 'coordinator' | 'volunteer' | 'organization';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  organizationId: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canEdit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const profile = await apiClient.get<User>('/auth/profile');
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('accessToken', token);
    await fetchUserProfile();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canEdit = (): boolean => {
    return hasRole(['admin', 'coordinator']);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        canEdit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
