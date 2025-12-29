import { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { token, user, activeTheme, loading, isAuthenticated, loginState, logoutState, updateActiveTheme } = context;

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: loginUser, activeTheme: theme } = response.data.data;
      loginState(newToken, loginUser, theme);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    logoutState();
  };

  return { token, user, activeTheme, loading, login, logout, isAuthenticated, updateActiveTheme };
};
