import { createContext } from 'react';

export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
