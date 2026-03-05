import { create } from "zustand"
import type { FusionSeparationHistoryState, FusionSeparationHistoryEntry } from "@/types/fusionSeparationHistory"
import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"

const mockHistoryEntries: FusionSeparationHistoryEntry[] = [
  {
    chronoEF: 1001,
    societe: "ACME Corp",
    compteReference: 12345,
    filiationReference: 1,
    comptePointeOld: 98765,
    filiationPointeOld: 2,
    comptePointeNew: 11111,
    filiationPointeNew: 3,
    typeEF: "FUSION",
    nom: "Dupont",
    prenom: "Jean"
  },
  {
    chronoEF: 1002,
    societe: "TechSoft Ltd",
    compteReference: 67890,
    filiationReference: 4,
    comptePointeOld: 22222,
    filiationPointeOld: 5,
    comptePointeNew: 33333,
    filiationPointeNew: 6,
    typeEF: "SEPARATION",
    nom: "Martin",
    prenom: "Marie"
  },
  {
    chronoEF: 1003,
    societe: "Global Solutions",
    compteReference: 24680,
    filiationReference: 7,
    comptePointeOld: 44444,
    filiationPointeOld: 8,
    comptePointeNew: 55555,
    filiationPointeNew: 9,
    typeEF: "FUSION",
    nom: "Bernard",
    prenom: "Pierre"
  }
]

export const useFusionSeparationHistoryStore = create<FusionSeparationHistoryState>((set, get) => ({
  historyEntries: [],
  isLoading: false,
  error: null,
  currentEntry: null,

  writeHistoryEntry: async (entry: FusionSeparationHistoryEntry) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        await apiClient.post("/api/histo-fusionseparation-saisie", { entry })
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
        mockHistoryEntries.push({ ...entry })
      }

      const currentEntries = get().historyEntries
      set({
        historyEntries: [...currentEntries, entry],
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to write history entry"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadHistoryEntries: async (filters?: { societe?: string; compteReference?: number; typeEF?: string }) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        const response = await apiClient.get<FusionSeparationHistoryEntry[]>(
          "/api/histo-fusionseparation-saisie",
          { params: filters }
        )
        set({
          historyEntries: response.data || [],
          isLoading: false
        })
      } else {
        let filteredEntries = [...mockHistoryEntries]

        if (filters) {
          if (filters.societe) {
            filteredEntries = filteredEntries.filter(entry =>
              entry.societe.toLowerCase().includes(filters.societe!.toLowerCase())
            )
          }
          if (filters.compteReference !== undefined) {
            filteredEntries = filteredEntries.filter(entry =>
              entry.compteReference === filters.compteReference
            )
          }
          if (filters.typeEF) {
            filteredEntries = filteredEntries.filter(entry =>
              entry.typeEF === filters.typeEF
            )
          }
        }

        set({
          historyEntries: filteredEntries,
          isLoading: false
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load history entries"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  formatFullName: (nom: string, prenom: string) => {
    return `${nom.trim()} ${prenom.trim()}`
  },

  setCurrentEntry: (entry: FusionSeparationHistoryEntry) => {
    set({ currentEntry: entry })
  },

  reset: () => {
    set({
      historyEntries: [],
      isLoading: false,
      error: null,
      currentEntry: null
    })
  }
}))