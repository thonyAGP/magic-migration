import type { Nullable } from './common';

export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  role: 'caissier' | 'superviseur' | 'admin';
}

export interface AuthState {
  user: Nullable<User>;
  token: Nullable<string>;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  login: string;
  password: string;
  societe: string;
}
