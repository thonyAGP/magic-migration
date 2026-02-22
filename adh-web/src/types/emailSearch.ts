import type { GmIdentifier } from "@/types";

export interface EmailAddress {
  id: number;
  societe: string;
  compte: string;
  filiation: number;
  email: string;
  isPrincipal: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GmRecord {
  societe: string;
  compte: string;
  filiation: number;
  nom: string | null;
  prenom: string | null;
}

export interface SearchFilters {
  societe: string;
  compte: string;
  filiation: number | null;
  email: string;
}

export interface CreateEmailDto {
  societe: string;
  compte: string;
  filiation: number;
  email: string;
  isPrincipal?: boolean;
}

export interface UpdateEmailDto {
  email?: string;
  isPrincipal?: boolean;
}

export interface EmailSearchState {
  emails: EmailAddress[];
  selectedEmail: EmailAddress | null;
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  searchEmails: (filters: SearchFilters) => Promise<void>;
  createEmail: (data: CreateEmailDto) => Promise<void>;
  updateEmail: (id: number, data: UpdateEmailDto) => Promise<void>;
  deleteEmail: (id: number) => Promise<void>;
  setAsPrincipal: (id: number) => Promise<void>;
  selectEmail: (email: EmailAddress | null) => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  resetState: () => void;
}

export interface GetEmailsRequest {
  societe?: string;
  compte?: string;
  filiation?: number;
  email?: string;
}

export interface GetEmailsResponse {
  data: EmailAddress[];
  count: number;
}

export interface CreateEmailRequest {
  societe: string;
  compte: string;
  filiation: number;
  email: string;
  isPrincipal?: boolean;
}

export interface CreateEmailResponse {
  data: EmailAddress;
}

export interface UpdateEmailRequest {
  email?: string;
  isPrincipal?: boolean;
}

export interface UpdateEmailResponse {
  data: EmailAddress;
}

export interface DeleteEmailResponse {
  success: boolean;
}

export interface SetPrincipalResponse {
  success: boolean;
}

export const EMPTY_SEARCH_FILTERS = {
  societe: '',
  compte: '',
  filiation: null,
  email: '',
} as const;

export const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ACTION_TYPES = {
  SEARCH_EMAILS: 'emailSearch/searchEmails',
  CREATE_EMAIL: 'emailSearch/createEmail',
  UPDATE_EMAIL: 'emailSearch/updateEmail',
  DELETE_EMAIL: 'emailSearch/deleteEmail',
  SET_PRINCIPAL: 'emailSearch/setAsPrincipal',
  SELECT_EMAIL: 'emailSearch/selectEmail',
  SET_FILTERS: 'emailSearch/setFilters',
  CLEAR_FILTERS: 'emailSearch/clearFilters',
  RESET_STATE: 'emailSearch/resetState',
} as const;