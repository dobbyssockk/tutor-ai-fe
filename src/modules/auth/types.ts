export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
};

export type CreateUser = {
  email: string;
  username: string;
  password: string;
};

export type LoginUser = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
