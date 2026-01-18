export type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  tutorInstructions?: string | null;
  createdAt: string;
};

export type CreateUser = {
  email: string;
  displayName?: string;
  password: string;
};

export type SignInUser = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type AuthMeResponse = {
  user: User;
};
