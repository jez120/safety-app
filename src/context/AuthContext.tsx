import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios'; // Needed for potential future token refresh or validation

// Define the shape of the user object we'll store
interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}

// Define the shape of the context value
interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean; // To handle initial loading state
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// Create the context with a default value (can be undefined or null initially)
// Using 'null!' assertion as we guarantee it's provided by AuthProvider
const AuthContext = createContext<AuthContextType>(null!);

// Create a custom hook for easy consumption of the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode; // To wrap around other components
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  useEffect(() => {
    // Check localStorage for existing token and user info on initial mount
    const storedToken = localStorage.getItem('authToken');
    const storedUserInfo = localStorage.getItem('userInfo');

    if (storedToken && storedUserInfo) {
      try {
        const parsedUser = JSON.parse(storedUserInfo) as User;
        // TODO: Optionally add token validation here (e.g., check expiry)
        // For now, just assume stored token is valid if present
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user info:", error);
        // Clear invalid stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    }
    setIsLoading(false); // Finished loading initial state
  }, []);

  // Login function: Updates state and localStorage
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    // Configure axios default headers (optional but good practice)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // Logout function: Clears state and localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    // Optionally redirect to login page here or handle in components
  };

  // Value object passed down through context
  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
  };

  // Provide the context value to children components
  // Don't render children until initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
