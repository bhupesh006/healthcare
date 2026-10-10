import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, type = 'ADMIN') => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const userData = res.data;
      
      // Role Validation based on toggle
      const isAdminRole = ['ADMIN', 'MANAGER'].includes(userData.role);
      
      if (type === 'ADMIN' && !isAdminRole) {
        return { success: false, message: 'Unauthorized. Please use the Staff login portal.' };
      }
      
      if (type === 'STAFF' && isAdminRole) {
        return { success: false, message: 'Please use the Admin login portal.' };
      }

      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Invalid email or password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
