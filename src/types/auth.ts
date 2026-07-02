export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "family";
  avatar?: string;
  createdAt: Date;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
