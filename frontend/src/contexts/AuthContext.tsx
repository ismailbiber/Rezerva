import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient, setAuthToken } from '../services/api';
import type { TokenResponse, User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rezerva_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initialise = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const response = await apiClient.get<User>('/auth/me');
          setUser(response.data);
        } catch (error) {
          setAuthToken(null);
          setToken(null);
        }
      } else {
        setAuthToken(null);
        setUser(null);
      }
      setLoading(false);
    };
    void initialise();
  }, [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);
      const { data } = await apiClient.post<TokenResponse>('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setAuthToken(data.access_token);
      setToken(data.access_token);
      const profile = await apiClient.get<User>('/auth/me');
      setUser(profile.data);
      navigate('/dashboard');
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    navigate('/login');
  }, [navigate]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const profile = await apiClient.get<User>('/auth/me');
    setUser(profile.data);
  }, [token]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refreshProfile }),
    [user, token, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
