export interface Session {
  id: number;
  societe: string;
  caisse: string;
  operateur: string;
  dateOuverture: Date;
  etat: string;
  montantOuverture: number | null;
}

export interface SessionFilter {
  existeSession: boolean;
  existeSessionOuverte: boolean;
  societe: string | null;
  deviseLocale: string | null;
}

export interface SessionListState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  filters: SessionFilter;
  fetchSessions: (filters: SessionFilter) => Promise<void>;
  setFilters: (filters: Partial<SessionFilter>) => void;
  clearError: () => void;
}

export interface GetSessionsListRequest {
  societe?: string;
  existeSession?: boolean;
  existeSessionOuverte?: boolean;
  deviseLocale?: string;
}

export type GetSessionsListResponse = Session[];

export const SESSION_STATE_EMPTY = '';
export const SESSION_STATE_OPEN = 'O';

export const SESSION_FILTER_DEFAULTS = {
  existeSession: true,
  existeSessionOuverte: true,
  societe: null,
  deviseLocale: null,
} as const satisfies SessionFilter;