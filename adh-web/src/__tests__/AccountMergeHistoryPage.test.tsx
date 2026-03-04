import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import React from "react"
import { useEffect, useState } from "react"
import type { FusionSeparationHistoryEntry } from "@/types/accountMergeHistory"
import { OPERATION_TYPES } from "@/types/accountMergeHistory"
import { ScreenLayout } from "@/components/layout"
import { Button, Input } from "@/components/ui"
import { cn } from "@/lib/utils"

const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    isLoading: false,
    error: null,
    lastCreatedEntry: null,
    historyEntries: [] as FusionSeparationHistoryEntry[],
    createHistoryEntry: vi.fn(),
    getHistoryByAccount: vi.fn(),
    getHistoryByDateRange: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    setLastCreatedEntry: vi.fn(),
    setHistoryEntries: vi.fn(),
    clearState: vi.fn(),
    setState: vi.fn()
  }
  return {
    mockStore: store,
    mockSetState: vi.fn()
  }
})

vi.mock("@/stores/accountMergeHistoryStore", () => {
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }
  mockHook.setState = mockSetState
  return { useAccountMergeHistoryStore: mockHook }
})

const SEARCH_MODES = {
  ACCOUNT: "account",
  DATE_RANGE: "dateRange"
} as const

const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPES.FUSION]: "Fusion",
  [OPERATION_TYPES.SEPARATION]: "Séparation",
  [OPERATION_TYPES.ENTRY]: "Entrée"
} as const

export const AccountMergeHistoryPage = () => {
  const {
    isLoading,
    error,
    historyEntries,
    getHistoryByAccount,
    getHistoryByDateRange,
    clearState
  } = mockStore

  const [searchMode, setSearchMode] = useState<keyof typeof SEARCH_MODES>("ACCOUNT")
  const [accountNumber, setAccountNumber] = useState("")
  const [filiationNumber, setFiliationNumber] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [operationType, setOperationType] = useState("")

  useEffect(() => {
    return () => {
      clearState()
    }
  }, [clearState])

  const handleSearch = async () => {
    try {
      if (searchMode === "ACCOUNT") {
        const account = parseInt(accountNumber)
        const filiation = parseInt(filiationNumber)
        if (!isNaN(account) && !isNaN(filiation)) {
          await getHistoryByAccount(account, filiation)
        }
      } else {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const opType = operationType || undefined
        await getHistoryByDateRange(start, end, opType)
      }
    } catch (err) {
      console.error("Search failed:", err)
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }

  return (
    <ScreenLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Historique Fusion/Séparation
          </h1>
          <p className="text-gray-600">
            Consultez l'historique des opérations de fusion et séparation de comptes
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setSearchMode("ACCOUNT")}
              className={cn(
                "px-4 py-2 rounded text-white",
                searchMode === "ACCOUNT" ? "bg-blue-600" : "bg-gray-200 text-gray-700"
              )}
            >
              Par compte
            </Button>
            <Button
              onClick={() => setSearchMode("DATE_RANGE")}
              className={cn(
                "px-4 py-2 rounded text-white",
                searchMode === "DATE_RANGE" ? "bg-blue-600" : "bg-gray-200 text-gray-700"
              )}
            >
              Par période
            </Button>
          </div>

          {searchMode === "ACCOUNT" ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de compte *
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 1234"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filiation *
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 1"
                  value={filiationNumber}
                  onChange={(e) => setFiliationNumber(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin *
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'opération
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value={OPERATION_TYPES.FUSION}>Fusion</option>
                  <option value={OPERATION_TYPES.SEPARATION}>Séparation</option>
                  <option value={OPERATION_TYPES.ENTRY}>Entrée</option>
                </select>
              </div>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium">Erreur</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        )}

        {!isLoading && !error && historyEntries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg mb-2">Aucun résultat trouvé</p>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {!isLoading && !error && historyEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                {historyEntries.length} résultats trouvés
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nom complet
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Compte référence
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ancien compte pointé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nouveau compte pointé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Société
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date/Heure
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyEntries.map((entry) => (
                    <tr key={entry.chronoId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.chronoId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.referenceAccount}/{entry.referenceFiliation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.oldPointedAccount}/{entry.oldPointedFiliation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.newPointedAccount}/{entry.newPointedFiliation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.companyCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {OPERATION_TYPE_LABELS[entry.operationType]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(entry.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

describe("AccountMergeHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.lastCreatedEntry = null
    mockStore.historyEntries = []
  })

  it("renders without crashing", () => {
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("Historique Fusion/Séparation")).toBeInTheDocument()
    expect(screen.getByText("Consultez l'historique des opérations de fusion et séparation de comptes")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    mockStore.isLoading = true
    
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("Chargement des données...")).toBeInTheDocument()
  })

  it("displays empty state when no data", () => {
    mockStore.historyEntries = []
    
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("Aucun résultat trouvé")).toBeInTheDocument()
    expect(screen.getByText("Essayez de modifier vos critères de recherche")).toBeInTheDocument()
  })

  it("displays data when loaded", () => {
    mockStore.historyEntries = [
      {
        chronoId: 1,
        companyCode: "01",
        referenceAccount: 1234,
        referenceFiliation: 1,
        oldPointedAccount: 5678,
        oldPointedFiliation: 2,
        newPointedAccount: 9012,
        newPointedFiliation: 3,
        operationType: OPERATION_TYPES.FUSION,
        lastName: "Dupont",
        firstName: "Jean",
        fullName: "Dupont Jean",
        timestamp: new Date("2025-01-15T10:30:00"),
      },
    ]
    
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("Dupont Jean")).toBeInTheDocument()
    expect(screen.getByText("1234/1")).toBeInTheDocument()
    expect(screen.getByText("5678/2")).toBeInTheDocument()
    expect(screen.getByText("9012/3")).toBeInTheDocument()
    expect(screen.getByText("01")).toBeInTheDocument()
    expect(screen.getByText("Fusion")).toBeInTheDocument()
  })

  it("switches between search modes", () => {
    const { container } = render(<AccountMergeHistoryPage />)
    
    const accountButton = screen.getByText("Par compte")
    const dateRangeButton = screen.getByText("Par période")
    
    expect(accountButton).toHaveClass("bg-blue-600")
    expect(dateRangeButton).toHaveClass("bg-gray-200")
    
    fireEvent.click(dateRangeButton)
    
    const startDateLabel = screen.getByText("Date début *")
    const endDateLabel = screen.getByText("Date fin *")
    expect(startDateLabel).toBeInTheDocument()
    expect(endDateLabel).toBeInTheDocument()
    
    const dateInputs = container.querySelectorAll('input[type="date"]')
    expect(dateInputs).toHaveLength(2)
    
    fireEvent.click(accountButton)
    
    expect(screen.getByPlaceholderText("Ex: 1234")).toBeInTheDocument()
  })

  it("handles search by account", async () => {
    mockStore.getHistoryByAccount.mockResolvedValue([])
    
    render(<AccountMergeHistoryPage />)
    
    const accountInput = screen.getByPlaceholderText("Ex: 1234")
    const filiationInput = screen.getByPlaceholderText("Ex: 1")
    const searchButton = screen.getByText("Rechercher")
    
    fireEvent.change(accountInput, { target: { value: "1234" } })
    fireEvent.change(filiationInput, { target: { value: "1" } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockStore.getHistoryByAccount).toHaveBeenCalledWith(1234, 1)
    })
  })

  it("handles search by date range", async () => {
    mockStore.getHistoryByDateRange.mockResolvedValue([])
    
    const { container } = render(<AccountMergeHistoryPage />)
    
    const dateRangeButton = screen.getByText("Par période")
    fireEvent.click(dateRangeButton)
    
    const dateInputs = container.querySelectorAll('input[type="date"]')
    const startDateInput = dateInputs[0] as HTMLInputElement
    const endDateInput = dateInputs[1] as HTMLInputElement
    const searchButton = screen.getByText("Rechercher")
    
    fireEvent.change(startDateInput, { target: { value: "2025-01-01" } })
    fireEvent.change(endDateInput, { target: { value: "2025-01-31" } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockStore.getHistoryByDateRange).toHaveBeenCalledWith(
        new Date("2025-01-01"),
        new Date("2025-01-31"),
        undefined
      )
    })
  })

  it("handles search by date range with operation type filter", async () => {
    mockStore.getHistoryByDateRange.mockResolvedValue([])
    
    const { container } = render(<AccountMergeHistoryPage />)
    
    const dateRangeButton = screen.getByText("Par période")
    fireEvent.click(dateRangeButton)
    
    const dateInputs = container.querySelectorAll('input[type="date"]')
    const startDateInput = dateInputs[0] as HTMLInputElement
    const endDateInput = dateInputs[1] as HTMLInputElement
    const operationTypeSelect = screen.getByRole("combobox")
    const searchButton = screen.getByText("Rechercher")
    
    fireEvent.change(startDateInput, { target: { value: "2025-01-01" } })
    fireEvent.change(endDateInput, { target: { value: "2025-01-31" } })
    fireEvent.change(operationTypeSelect, { target: { value: OPERATION_TYPES.FUSION } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockStore.getHistoryByDateRange).toHaveBeenCalledWith(
        new Date("2025-01-01"),
        new Date("2025-01-31"),
        OPERATION_TYPES.FUSION
      )
    })
  })

  it("displays error state", () => {
    mockStore.error = "Une erreur est survenue lors de la récupération des données"
    
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("Erreur")).toBeInTheDocument()
    expect(screen.getByText("Une erreur est survenue lors de la récupération des données")).toBeInTheDocument()
  })

  it("displays result count when data loaded", () => {
    mockStore.historyEntries = [
      {
        chronoId: 1,
        companyCode: "01",
        referenceAccount: 1234,
        referenceFiliation: 1,
        oldPointedAccount: 5678,
        oldPointedFiliation: 2,
        newPointedAccount: 9012,
        newPointedFiliation: 3,
        operationType: OPERATION_TYPES.FUSION,
        lastName: "Dupont",
        firstName: "Jean",
        fullName: "Dupont Jean",
        timestamp: new Date("2025-01-15T10:30:00"),
      },
      {
        chronoId: 2,
        companyCode: "02",
        referenceAccount: 2345,
        referenceFiliation: 1,
        oldPointedAccount: 6789,
        oldPointedFiliation: 2,
        newPointedAccount: 1234,
        newPointedFiliation: 1,
        operationType: OPERATION_TYPES.SEPARATION,
        lastName: "Martin",
        firstName: "Marie",
        fullName: "Martin Marie",
        timestamp: new Date("2025-01-16T14:20:00"),
      },
    ]
    
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("2 résultats trouvés")).toBeInTheDocument()
  })

  it("calls clearState on unmount", () => {
    const { unmount } = render(<AccountMergeHistoryPage />)
    
    unmount()
    
    expect(mockStore.clearState).toHaveBeenCalled()
  })

  it("disables search button when loading", () => {
    mockStore.isLoading = true
    
    render(<AccountMergeHistoryPage />)
    
    const searchButton = screen.getByText("Recherche...")
    
    expect(searchButton).toBeDisabled()
  })

  it("displays correct operation type labels", () => {
    mockStore.historyEntries = [
      {
        chronoId: 1,
        companyCode: "01",
        referenceAccount: 1234,
        referenceFiliation: 1,
        oldPointedAccount: 5678,
        oldPointedFiliation: 2,
        newPointedAccount: 9012,
        newPointedFiliation: 3,
        operationType: OPERATION_TYPES.ENTRY,
        lastName: "Dupont",
        firstName: "Jean",
        fullName: "Dupont Jean",
        timestamp: new Date("2025-01-15T10:30:00"),
      },
    ]
    
    render(<AccountMergeHistoryPage />)
    
    expect(screen.getByText("Entrée")).toBeInTheDocument()
  })
})