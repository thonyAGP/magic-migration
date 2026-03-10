/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("@/stores/sessionHistoryStore", () => ({
  useSessionHistoryStore: vi.fn()
}))

vi.mock("@/components/layout", () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  )
}))

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className, variant }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
    variant?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Input: ({ value, onChange, type, className, placeholder, id }: {
    value?: string
    onChange?: (e: { target: { value: string } }) => void
    type?: string
    className?: string
    placeholder?: string
    id?: string
  }) => (
    <input
      id={id}
      value={value || ""}
      onChange={onChange}
      type={type}
      className={className}
      placeholder={placeholder}
    />
  )
}))

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" ")
}))

import { SessionHistoryPage } from "@/pages/SessionHistoryPage"
import { useSessionHistoryStore } from "@/stores/sessionHistoryStore"

const mockStore = {
  sessions: [],
  selectedSessionId: null,
  selectedSessionDetails: null,
  selectedSessionCurrencies: [],
  isLoading: false,
  error: null,
  filters: {},
  startDate: null,
  endDate: null,
  status: null,
  operatorId: "",
  isFiltersApplied: false,
  totalSessions: 0,
  currentPage: 1,
  pageSize: 10,
  sortBy: "sessionId",
  sortOrder: "asc" as const,
  hasNextPage: false,
  hasPreviousPage: false,
  canApplyFilters: false,
  canClearFilters: false,
  lastUpdated: null,
  loadSessions: vi.fn(),
  loadSessionDetails: vi.fn(),
  selectSession: vi.fn(),
  setFilters: vi.fn(),
  setStartDate: vi.fn(),
  setEndDate: vi.fn(),
  setStatus: vi.fn(),
  setOperatorId: vi.fn(),
  applyFilters: vi.fn(),
  clearFilters: vi.fn(),
  setPage: vi.fn(),
  setSortBy: vi.fn(),
  toggleSortOrder: vi.fn(),
  reset: vi.fn()
}

const mockSessionHistoryStore = useSessionHistoryStore as unknown as ReturnType<typeof vi.fn>

describe("SessionHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionHistoryStore.mockReturnValue(mockStore)
  })

  it("renders without crashing", () => {
    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Historique des Sessions")).toBeInTheDocument()
    expect(screen.getByText("Consultation des sessions de caisse ouvertes et fermées")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      isLoading: true
    })

    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Chargement...")).toBeInTheDocument()
  })

  it("displays data when loaded", () => {
    const mockSessions = [
      {
        sessionId: "S001",
        openedDate: new Date("2024-01-15"),
        openedTime: "09:00",
        closedDate: new Date("2024-01-15"),
        closedTime: "17:00",
        operatorId: "OP001",
        status: "CLOSED"
      },
      {
        sessionId: "S002",
        openedDate: new Date("2024-01-16"),
        openedTime: "09:30",
        closedDate: null,
        closedTime: null,
        operatorId: "OP002",
        status: "OPEN"
      }
    ]

    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      sessions: mockSessions,
      totalSessions: 2
    })

    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Sessions (2)")).toBeInTheDocument()
    expect(screen.getByText("S001")).toBeInTheDocument()
    expect(screen.getByText("S002")).toBeInTheDocument()
    expect(screen.getByText("OP001")).toBeInTheDocument()
    expect(screen.getByText("OP002")).toBeInTheDocument()
  })

  it("displays selected session details", () => {
    const mockSessionDetails = {
      sessionId: "S001",
      operatorId: "OP001",
      openedDate: new Date("2024-01-15"),
      openedTime: "09:00",
      closedDate: new Date("2024-01-15"),
      closedTime: "17:00",
      status: "CLOSED",
      totalAmount: 150.50,
      description: "Test session"
    }

    const mockCurrencies = [
      {
        currencyCode: "EUR",
        amount: 150.50,
        isLocalCurrency: true
      },
      {
        currencyCode: "USD",
        amount: 25.00,
        isLocalCurrency: false
      }
    ]

    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      selectedSessionId: "S001",
      selectedSessionDetails: mockSessionDetails,
      selectedSessionCurrencies: mockCurrencies
    })

    render(<SessionHistoryPage />)
    
    expect(screen.getByText("S001")).toBeInTheDocument()
    expect(screen.getByText("OP001")).toBeInTheDocument()
    expect(screen.getByText("150.50 €")).toBeInTheDocument()
    expect(screen.getByText("Test session")).toBeInTheDocument()
    expect(screen.getByText("EUR")).toBeInTheDocument()
    expect(screen.getByText("USD")).toBeInTheDocument()
    expect(screen.getByText("150.50")).toBeInTheDocument()
    expect(screen.getByText("25.00")).toBeInTheDocument()
  })

  it("handles user interactions", async () => {
    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      canApplyFilters: true
    })

    const { container } = render(<SessionHistoryPage />)
    
    const dateInputs = container.querySelectorAll('input[type="date"]')
    const startDateInput = dateInputs[0] as HTMLInputElement
    fireEvent.change(startDateInput, { target: { value: "2024-01-15" } })
    
    await waitFor(() => {
      expect(mockStore.setStartDate).toHaveBeenCalled()
    })

    const statusSelect = screen.getByDisplayValue("Tous")
    fireEvent.change(statusSelect, { target: { value: "CLOSED" } })
    
    await waitFor(() => {
      expect(mockStore.setStatus).toHaveBeenCalledWith("CLOSED")
    })

    const operatorInput = screen.getByPlaceholderText("Rechercher par opérateur...")
    fireEvent.change(operatorInput, { target: { value: "OP001" } })
    
    await waitFor(() => {
      expect(mockStore.setOperatorId).toHaveBeenCalledWith("OP001")
    })

    const applyButton = screen.getByText("Appliquer les filtres")
    fireEvent.click(applyButton)
    
    await waitFor(() => {
      expect(mockStore.applyFilters).toHaveBeenCalled()
    })
  })

  it("handles session selection", async () => {
    const mockSessions = [
      {
        sessionId: "S001",
        openedDate: new Date("2024-01-15"),
        openedTime: "09:00",
        closedDate: new Date("2024-01-15"),
        closedTime: "17:00",
        operatorId: "OP001",
        status: "CLOSED"
      }
    ]

    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      sessions: mockSessions,
      totalSessions: 1
    })

    render(<SessionHistoryPage />)
    
    const sessionRow = screen.getByText("S001").closest("tr")
    fireEvent.click(sessionRow!)
    
    await waitFor(() => {
      expect(mockStore.selectSession).toHaveBeenCalledWith("S001")
      expect(mockStore.loadSessionDetails).toHaveBeenCalledWith("S001")
    })
  })

  it("handles sorting", async () => {
    const mockSessions = [
      {
        sessionId: "S001",
        openedDate: new Date("2024-01-15"),
        openedTime: "09:00",
        closedDate: new Date("2024-01-15"),
        closedTime: "17:00",
        operatorId: "OP001",
        status: "CLOSED"
      }
    ]

    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      sessions: mockSessions,
      totalSessions: 1
    })

    render(<SessionHistoryPage />)
    
    const sessionIdHeader = screen.getByText("ID Session")
    fireEvent.click(sessionIdHeader)
    
    await waitFor(() => {
      expect(mockStore.toggleSortOrder).toHaveBeenCalled()
    })

    const dateHeader = screen.getByText("Date ouverture")
    fireEvent.click(dateHeader)
    
    await waitFor(() => {
      expect(mockStore.setSortBy).toHaveBeenCalledWith("openedDate")
    })
  })

  it("handles clear filters", async () => {
    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      canClearFilters: true
    })

    render(<SessionHistoryPage />)
    
    const clearButton = screen.getByText("Effacer les filtres")
    fireEvent.click(clearButton)
    
    await waitFor(() => {
      expect(mockStore.clearFilters).toHaveBeenCalled()
    })
  })

  it("displays error state", () => {
    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      error: "Network error occurred"
    })

    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Erreur: Network error occurred")).toBeInTheDocument()
  })

  it("displays empty state when no sessions found", () => {
    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      sessions: [],
      totalSessions: 0,
      isLoading: false
    })

    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Aucune session trouvée")).toBeInTheDocument()
  })

  it("displays empty details state when no session selected", () => {
    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Sélectionnez une session pour voir les détails")).toBeInTheDocument()
    expect(screen.getByText("Sélectionnez une session pour voir les devises")).toBeInTheDocument()
  })

  it("displays empty currencies state when session has no currencies", () => {
    const mockSessionDetails = {
      sessionId: "S001",
      operatorId: "OP001",
      openedDate: new Date("2024-01-15"),
      openedTime: "09:00",
      closedDate: null,
      closedTime: null,
      status: "OPEN",
      totalAmount: 0
    }

    mockSessionHistoryStore.mockReturnValue({
      ...mockStore,
      selectedSessionId: "S001",
      selectedSessionDetails: mockSessionDetails,
      selectedSessionCurrencies: []
    })

    render(<SessionHistoryPage />)
    
    expect(screen.getByText("Aucune devise pour cette session")).toBeInTheDocument()
  })

  it("calls loadSessions and reset on mount and unmount", () => {
    const { unmount } = render(<SessionHistoryPage />)
    
    expect(mockStore.loadSessions).toHaveBeenCalled()
    
    unmount()
    expect(mockStore.reset).toHaveBeenCalled()
  })
})