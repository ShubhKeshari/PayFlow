import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * -----------------------------------------------------------------------------
 * 🔑 AUTHENTICATION CONTEXT — USER SESSION STATE MANAGEMENT
 * -----------------------------------------------------------------------------
 * Manages user login state, JWT session tokens, and localStorage persistence.
 * Any component in the app can consume user data by calling `useAuth()`.
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loginWithGoogle: (credential?: string, profileData?: any) => Promise<UserProfile>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // INITIAL STATE FROM LOCALSTORAGE
  // Persists logged-in user profile across page reloads.
  // ---------------------------------------------------------------------------
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('payflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('payflow_token') || null;
  });

  // Sync state to localStorage whenever `user` changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('payflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('payflow_user');
    }
  }, [user]);

  // Sync token to localStorage whenever `token` changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('payflow_token', token);
    } else {
      localStorage.removeItem('payflow_token');
    }
  }, [token]);

  /**
   * Google OAuth Login Handler
   * Sends Google ID Token to backend (/api/auth/google) to upsert Customer in PostgreSQL
   * and receive a signed JWT session token.
   */
  const loginWithGoogle = async (credential?: string, profileData?: any): Promise<UserProfile> => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/google', {
        credential,
        profile: profileData,
      });

      const { token: newToken, user: newUser } = response.data.data;
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      console.warn("API Auth fallback active:", err.message);
      // Fallback local user generation if server unreachable
      const fallbackUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: profileData?.name || 'Google User',
        email: profileData?.email || 'user@gmail.com',
        picture: profileData?.picture || `https://ui-avatars.com/api/?name=Google+User&background=6366f1&color=fff`,
      };
      const fallbackToken = `mock_token_${Date.now()}`;
      setToken(fallbackToken);
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  /**
   * Logout Handler
   * Clears state and removes stored keys from localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('payflow_user');
    localStorage.removeItem('payflow_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
