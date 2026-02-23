// Authentication types

export interface UserCredentials {
  login: string;
  matricule: string;
}

export interface AuthenticationState {
  matricule: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GetMatriculeRequest {
  login: string;
}

export interface GetMatriculeResponse {
  matricule: string;
}

export interface AuthenticationStore extends AuthenticationState {
  getMatricule: (login: string) => Promise<void>;
  setMatricule: (matricule: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}