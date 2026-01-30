import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('caixa_token');
    const savedUser = localStorage.getItem('caixa_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      if (!['admin', 'caixa'].includes(userData.perfil)) {
        throw new Error('Acesso não autorizado');
      }
      
      setUser(userData);
      localStorage.setItem('caixa_user', JSON.stringify(userData));
    } catch {
      localStorage.removeItem('caixa_token');
      localStorage.removeItem('caixa_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    const response = await api.post('/auth/login', { email, password: senha });
    const { user: userData, token } = response.data;
    
    if (!['admin', 'caixa'].includes(userData.perfil)) {
      throw new Error('Acesso permitido apenas para operadores de caixa');
    }
    
    localStorage.setItem('caixa_token', token);
    localStorage.setItem('caixa_user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('caixa_token');
      localStorage.removeItem('caixa_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
