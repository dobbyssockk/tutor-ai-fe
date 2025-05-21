import { create } from 'zustand';
import { User } from './types';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const useAuthStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user: user })),
  logout: () => {
    localStorage.removeItem('authToken');
    return set(() => ({ user: null }));
  },
}));

export default useAuthStore;
