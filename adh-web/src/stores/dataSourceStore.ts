import { create } from 'zustand';

interface DataSourceState {
  isRealApi: boolean;
  toggle: () => void;
  setRealApi: (value: boolean) => void;
}

export const useDataSourceStore = create<DataSourceState>()(
  (set) => ({
    isRealApi: false,
    toggle: () => set((state) => ({ isRealApi: !state.isRealApi })),
    setRealApi: (value: boolean) => set({ isRealApi: value }),
  })
);
