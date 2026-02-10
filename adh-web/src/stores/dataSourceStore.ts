import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DataSourceState {
  isRealApi: boolean;
  toggle: () => void;
  setRealApi: (value: boolean) => void;
}

export const useDataSourceStore = create<DataSourceState>()(
  persist(
    (set) => ({
      isRealApi: false,
      toggle: () => set((state) => ({ isRealApi: !state.isRealApi })),
      setRealApi: (value: boolean) => set({ isRealApi: value }),
    }),
    {
      name: 'adh-datasource',
    }
  )
);
