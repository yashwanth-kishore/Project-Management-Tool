import { createContext, useContext, useState, useCallback } from "react";

const TOKEN_KEY = "pmtool_token";
const USER_KEY = "pmtool_user";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setToken = useCallback((newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const setUserState = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserState(null);
  }, [setToken, setUserState]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser: setUserState,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
