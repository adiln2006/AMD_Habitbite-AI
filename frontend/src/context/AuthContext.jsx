import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dummyUser = {
    _id: 'dummy123',
    name: 'Sahil Shaikh',
    email: 'sahil@habitbite.com',
    dailyCalorieGoal: 2000,
    preferredCuisine: 'Indian',
    goal: 'healthy_eating',
    age: 22,
    weight: 70,
    height: 172,
    token: 'dummy-token-skip-auth',
  };

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('habitbite_user');
    return stored ? JSON.parse(stored) : dummyUser;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('habitbite_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('habitbite_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await registerUser(formData);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await logoutUser(); } catch (e) { /* ignore */ }
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
