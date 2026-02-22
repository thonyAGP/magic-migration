// Title lookup types (reference table - arc_transac_detail_bar)

export interface Title {
  code: string;
  label: string;
  type: string;
}

export interface TitleLookupResponse {
  label: string;
}

export interface TitleLookupState {
  titles: Title[];
  isLoading: boolean;
  error: string | null;
  getTitleByCode: (code: string, programType?: string) => Promise<string>;
  loadTitles: () => Promise<void>;
  setTitles: (titles: Title[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const PROGRAM_TYPE_DEFAULT = 'CA' as const;

export type TitleLoadingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TITLES'; payload: Title[] }
  | { type: 'LOAD_TITLES_START' }
  | { type: 'LOAD_TITLES_SUCCESS'; payload: Title[] }
  | { type: 'LOAD_TITLES_ERROR'; payload: string };