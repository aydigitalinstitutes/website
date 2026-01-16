import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the backend URL (local or production)
  // In development, we can point to localhost:3000
  // In production, this should be an env var
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    // Check local storage for existing session on load
    const storedUser = localStorage.getItem('ay_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('ay_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Connection to server failed. Please ensure backend is running.' };
    }
  };

  const updateProfile = async (address, phone) => {
    try {
      const response = await fetch(`${API_URL}/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id, address, phone }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user in state and local storage
        setUser(data.user);
        localStorage.setItem('ay_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Update failed' };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Connection to server failed.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ay_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
