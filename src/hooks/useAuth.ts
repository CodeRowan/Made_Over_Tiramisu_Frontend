/**
 * useAuth Hook
 *
 * Manages authentication state and provides auth utilities.
 * Used throughout the app to check if user is logged in.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    navigate('/admin/login');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}
