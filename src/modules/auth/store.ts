import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { User } from './types';

type UserState = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const useAuthStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        setToken: (token) => set(() => ({ token: token })),
        setUser: (user) => set(() => ({ user: user })),
        logout: () => set(() => ({ user: null, token: null })),
      }),
      { name: 'authToken', partialize: (state) => ({ token: state.token }) }
    )
  )
);

export default useAuthStore;
