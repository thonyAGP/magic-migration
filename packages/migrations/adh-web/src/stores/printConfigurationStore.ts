import { create } from 'zustand';
import type { PrintConfig } from '@/types/printConfiguration';
import { useDataSourceStore } from './dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface PrintConfigState {
  currentConfig: PrintConfig | null;
  isInitializing: boolean;
  error: string | null;
}

interface PrintConfigActions {
  setListingNumber: (listingNumber: number) => Promise<void>;
  resetPrintParameters: () => Promise<void>;
  getPrintConfig: () => Promise<PrintConfig>;
  setError: (error: string | null) => void;
  reset: () => void;
}

type PrintConfigStore = PrintConfigState & PrintConfigActions;

const DEFAULT_CONFIG: PrintConfig = {
  currentListingNum: 0,
  currentPrinterName: 'VOID',
  currentPrinterNum: 0,
  numberCopies: 0,
  specificPrint: 'VOID',
};

const initialState: PrintConfigState = {
  currentConfig: null,
  isInitializing: false,
  error: null,
};

export const usePrintConfigStore = create<PrintConfigStore>()((set, get) => ({
  ...initialState,

  setListingNumber: async (listingNumber) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isInitializing: true, error: null });

    if (!isRealApi) {
      const config: PrintConfig = {
        currentListingNum: listingNumber,
        currentPrinterName: 'VOID',
        currentPrinterNum: 0,
        numberCopies: 0,
        specificPrint: 'VOID',
      };
      set({ currentConfig: config, isInitializing: false });
      return;
    }

    try {
      await apiClient.post<ApiResponse<void>>('/api/print-config/set-listing', {
        listingNumber,
      });
      const updatedConfig = await get().getPrintConfig();
      set({ currentConfig: updatedConfig });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur configuration listing';
      set({ error: message });
      throw e;
    } finally {
      set({ isInitializing: false });
    }
  },

  resetPrintParameters: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isInitializing: true, error: null });

    if (!isRealApi) {
      const current = get().currentConfig ?? DEFAULT_CONFIG;
      const config: PrintConfig = {
        ...current,
        currentPrinterName: 'VOID',
        currentPrinterNum: 0,
        numberCopies: 0,
      };
      set({ currentConfig: config, isInitializing: false });
      return;
    }

    try {
      await apiClient.post<ApiResponse<void>>('/api/print-config/reset', {});
      const updatedConfig = await get().getPrintConfig();
      set({ currentConfig: updatedConfig });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur réinitialisation';
      set({ error: message });
      throw e;
    } finally {
      set({ isInitializing: false });
    }
  },

  getPrintConfig: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isInitializing: true, error: null });

    if (!isRealApi) {
      const config = get().currentConfig ?? DEFAULT_CONFIG;
      set({ isInitializing: false });
      return config;
    }

    try {
      const response = await apiClient.get<ApiResponse<PrintConfig>>('/api/print-config');
      const config = response.data.data ?? DEFAULT_CONFIG;
      set({ currentConfig: config });
      return config;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lecture config';
      set({ error: message });
      throw e;
    } finally {
      set({ isInitializing: false });
    }
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => set({ ...initialState }),
}));