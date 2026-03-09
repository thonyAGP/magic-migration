import { create } from "zustand"
import type { GlobalContext } from "@/types/historyCleanup"

interface GlobalContextStoreState extends GlobalContext {
  currentUser: { id: string } | null
}

type GlobalContextStore = GlobalContextStoreState & {
  reset: () => void
}

const initialState: GlobalContextStoreState = {
  sessionKey: undefined,
  currentSociete: undefined,
  currentUser: null,
  operationContext: undefined,
}

export const useGlobalContextStore = create<GlobalContextStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
}))
