export interface PrintConfig {
  currentListingNum: number;
  currentPrinterName: string;
  currentPrinterNum: number;
  numberCopies: number;
  specificPrint: string;
}

export interface SetListingRequest {
  listingNumber: number;
}

export interface ResetPrintParametersRequest {}

export interface GetPrintConfigRequest {}

export type PrintConfigAction = 
  | { type: 'SET_CONFIG'; payload: PrintConfig }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

export interface PrintConfigState {
  currentConfig: PrintConfig | null;
  isInitializing: boolean;
  error: string | null;
  setListingNumber: (listingNumber: number) => Promise<void>;
  resetPrintParameters: () => Promise<void>;
  getPrintConfig: () => Promise<PrintConfig>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  currentListingNum: 0,
  currentPrinterName: 'VOID',
  currentPrinterNum: 0,
  numberCopies: 0,
  specificPrint: 'VOID',
};