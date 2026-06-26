import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import axios from 'axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'moviebook_token';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Session verification expired or invalid', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axios.post('/api/auth/register', { name, email, password });
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be mounted inside an AuthProvider');
  }
  return context;
};

export default AuthContext;
