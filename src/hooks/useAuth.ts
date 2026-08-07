/**
 * useAuth Hook
 *
 * Manages authentication state and provides auth utilities.
 * Used throughout the app to check if user is logged in.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../services/authStorage';

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
    const token = authStorage.getToken();
    const user = authStorage.getUser<User>();

    if (token && user) {
      setUser(user);
    } else if (token && !user) {
      // Token present but the stored profile is missing/corrupt — drop both
      authStorage.clear();
    }

    setLoading(false);
  }, []);

  const logout = () => {
    authStorage.clear();
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
