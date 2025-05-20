import { create } from 'zustand';
import { User } from './types';

type UserState = {
  user: User | null;
  setUser: (user: User) => void;
};

const useAuthStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user: user })),
}));

export default useAuthStore;
