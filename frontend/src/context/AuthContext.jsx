import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create context - like a "global storage box" for user information
const AuthContext = createContext();

// Custom hook to use auth context - like a "key" to access the storage box
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true; // Send cookies with requests

// AuthProvider component - wraps our entire app to provide user data everywhere
export function AuthProvider({ children }) {
  // State to store user information
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to register a new user
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Attempting to register user:', userData.email);
      
      const response = await axios.post('/auth/register', userData);
      
      console.log('Registration successful:', response.data);
      
      // Store user data and token
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to login user
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Attempting to login user:', email);
      
      const response = await axios.post('/auth/login', { email, password });
      
      console.log('Login successful:', response.data);
      
      // Store user data and token
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to logout user
  const logout = async () => {
    try {
      setError(null);
      
      console.log('Logging out user');
      
      await axios.post('/auth/logout');
      
      // Clear user data and token
      setUser(null);
      localStorage.removeItem('token');
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server request fails, clear local data
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // Function to get current user info
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, user not logged in');
        setLoading(false);
        return;
      }
      
      console.log('Checking current user with token');
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get('/auth/me');
      
      console.log('Current user found:', response.data.user);
      
      setUser(response.data.user);
    } catch (error) {
      console.error('Get current user error:', error);
      
      // If token is invalid, clear it
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      console.log('Updating user profile');
      
      const response = await axios.put('/auth/profile', profileData);
      
      console.log('Profile updated:', response.data.user);
      
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Function to clear errors
  const clearError = () => {
    setError(null);
  };

  // Check if user is logged in when component mounts
  useEffect(() => {
    console.log('AuthProvider mounted, checking current user');
    getCurrentUser();
  }, []);

  // Set up axios interceptor to handle token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Token expired or invalid, logging out');
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // All the functions and data we want to share with other components
  const value = {
    user,                    // Current user data (null if not logged in)
    loading,                 // Whether we're checking authentication status
    error,                   // Any authentication errors
    register,                // Function to register new user
    login,                   // Function to login user
    logout,                  // Function to logout user
    updateProfile,           // Function to update user profile
    clearError,              // Function to clear errors
    isAuthenticated: !!user  // Boolean - true if user is logged in
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}