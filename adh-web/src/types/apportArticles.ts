export interface ArticleApport {
  articleCode: string;
  libelle: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface ApportArticlesPayload {
  sessionId: string;
  operateur: string;
  articles: ArticleApport[];
  dateTime: Date;
  deviseCode: string;
}

export interface ApportArticlesRequest {
  sessionId: string;
  operateur: string;
  articles: ArticleApport[];
  dateTime: Date;
  deviseCode: string;
}

export interface ApportArticlesResponse {
  success: boolean;
  message?: string;
}

export interface ApportArticlesState {
  articles: ArticleApport[];
  total: number;
  deviseCode: string;
  isExecuting: boolean;
  error: string | null;
  editingIndex: number | null;
  addArticle: (article: Omit<ArticleApport, "montant">) => void;
  updateArticle: (
    index: number,
    article: Omit<ArticleApport, "montant">
  ) => void;
  removeArticle: (index: number) => void;
  submitApport: (sessionId: string, operateur: string) => Promise<void>;
  reset: () => void;
  calculateTotal: () => void;
  setEditingIndex: (index: number | null) => void;
  setDeviseCode: (code: string) => void;
  setError: (error: string | null) => void;
}

export type AddArticleAction = {
  type: "ADD_ARTICLE";
  payload: Omit<ArticleApport, "montant">;
};

export type UpdateArticleAction = {
  type: "UPDATE_ARTICLE";
  payload: {
    index: number;
    article: Omit<ArticleApport, "montant">;
  };
};

export type RemoveArticleAction = {
  type: "REMOVE_ARTICLE";
  payload: number;
};

export type SubmitApportAction = {
  type: "SUBMIT_APPORT";
  payload: {
    sessionId: string;
    operateur: string;
  };
};

export type ResetAction = {
  type: "RESET";
};

export type CalculateTotalAction = {
  type: "CALCULATE_TOTAL";
};

export type SetEditingIndexAction = {
  type: "SET_EDITING_INDEX";
  payload: number | null;
};

export type SetDevisCodeAction = {
  type: "SET_DEVISE_CODE";
  payload: string;
};

export type SetErrorAction = {
  type: "SET_ERROR";
  payload: string | null;
};

export type ApportArticlesAction =
  | AddArticleAction
  | UpdateArticleAction
  | RemoveArticleAction
  | SubmitAportAction
  | ResetAction
  | CalculateTotalAction
  | SetEditingIndexAction
  | SetDevisCodeAction
  | SetErrorAction;