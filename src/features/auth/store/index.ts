import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { User } from '@/features/auth/types';

type UserState = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => void;
};

const useAuthStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        setToken: (token) => set(() => ({ token: token })),
        setUser: (user) => set(() => ({ user: user })),
        signOut: () => set(() => ({ user: null, token: null })),
      }),
      { name: 'authToken', partialize: (state) => ({ token: state.token }) }
    )
  )
);

export default useAuthStore;
