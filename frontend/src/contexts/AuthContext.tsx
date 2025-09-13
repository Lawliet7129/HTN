import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserType = 'student' | 'educator';

interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userType: UserType) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Simple in-memory user database for demo purposes
const userDatabase: { [email: string]: { password: string, name: string, userType: UserType } } = {};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('canvasify_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Login attempt for email:', email);
      console.log('User database:', userDatabase);
      
      // Check if user exists in our database
      if (userDatabase[email]) {
        const userInfo = userDatabase[email];
        console.log('Found user in database:', userInfo);
        
        // In a real app, you would verify the password hash here
        if (userInfo.password === password) {
          const userData: User = {
            id: '1',
            name: userInfo.name,
            email: email,
            userType: userInfo.userType
          };
          
          console.log('Login successful, user data:', userData);
          setUser(userData);
          localStorage.setItem('canvasify_user', JSON.stringify(userData));
        } else {
          throw new Error('Invalid password');
        }
      } else {
        // For demo purposes, create a default student user if not found
        console.log('User not found in database, creating default student');
        const userData: User = {
          id: '1',
          name: email.split('@')[0],
          email: email,
          userType: 'student'
        };
        
        setUser(userData);
        localStorage.setItem('canvasify_user', JSON.stringify(userData));
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, userType: UserType): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Signup with userType:', userType);
      
      // Check if user already exists
      if (userDatabase[email]) {
        throw new Error('User with this email already exists');
      }
      
      // Store user in database
      userDatabase[email] = {
        password: password,
        name: name,
        userType: userType
      };
      
      console.log('User stored in database:', userDatabase[email]);
      console.log('Full database:', userDatabase);
      
      const userData: User = {
        id: '1',
        name: name,
        email: email,
        userType: userType
      };
      
      console.log('Signup user data:', userData);
      setUser(userData);
      localStorage.setItem('canvasify_user', JSON.stringify(userData));
      console.log('User data saved to localStorage');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('canvasify_user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
