// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"

const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    accountStatements: [],
    auditLogs: [],
    isLoading: false,
    error: null,
    currentPrinter: 1,
    isDirectCall: false,
    processingStatus: "",
    validatePrinter1: vi.fn(),
    validatePrinter6: vi.fn(),
    validatePrinter8: vi.fn(),
    validatePrinter9: vi.fn(),
    validateDirectCall: vi.fn(),
    generateAccountStatement: vi.fn(),
    printStatementByName: vi.fn(),
    logPrintOperation: vi.fn(),
    reset: vi.fn(),
    setState: vi.fn()
  }
  return {
    mockStore: store,
    mockSetState: vi.fn()
  }
})

vi.mock("@/stores/accountStatementStore", () => {
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }
  mockHook.setState = mockSetState
  return { useAccountStatementStore: mockHook }
})

vi.mock("@/components/layout", () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="screen-layout">{children}</div>
  )
}))

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, variant, className }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    className?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
  Dialog: ({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) => (
    open ? <div data-testid="dialog" onClick={() => onOpenChange?.(false)}>{children}</div> : null
  ),
  Input: ({ id, value, onChange, placeholder, disabled, type, className }: {
    id?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    type?: string
    className?: string
  }) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      className={className}
      data-testid={id || "input"}
    />
  )
}))

vi.mock("@/lib/utils", () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(" ")
}))

global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ config: "test" }),
    statusText: "OK"
  })
)

import { AccountStatementPage } from "@/pages/AccountStatementPage"

describe("AccountStatementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.accountStatements = []
    mockStore.auditLogs = []
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.currentPrinter = 1
    mockStore.isDirectCall = false
    mockStore.processingStatus = ""
  })

  it("renders without crashing", () => {
    render(<AccountStatementPage />)
    
    expect(screen.getByText("Édition Extrait de Compte Cumulé")).toBeInTheDocument()
    expect(screen.getByText("Génération et impression des extraits de compte pour les adhérents")).toBeInTheDocument()
    expect(screen.getByLabelText("Code Adhérent")).toBeInTheDocument()
    expect(screen.getByLabelText("Date Cumulative")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    mockStore.isLoading = true
    
    render(<AccountStatementPage />)
    
    const loadingSection = screen.getByText("Chargement en cours...")
    expect(loadingSection.closest('.bg-yellow-50')).toBeInTheDocument()
  })

  it("displays error state", () => {
    mockStore.error = "Une erreur de validation est survenue"
    
    render(<AccountStatementPage />)
    
    expect(screen.getByText("Erreur")).toBeInTheDocument()
    expect(screen.getByText("Une erreur de validation est survenue")).toBeInTheDocument()
  })

  it("displays account statements when loaded", () => {
    mockStore.accountStatements = [
      {
        memberCode: "M001",
        memberName: "Jean Dupont",
        memberNumber: "12345",
        currency: "EUR",
        accountingPeriod: "2024",
        printMask: null,
        editionLabel: null
      },
      {
        memberCode: "M002",
        memberName: "Marie Martin",
        memberNumber: "67890",
        currency: "USD",
        accountingPeriod: "2024",
        printMask: null,
        editionLabel: null
      }
    ]
    
    render(<AccountStatementPage />)
    
    expect(screen.getByText("Adhérents Disponibles")).toBeInTheDocument()
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument()
    expect(screen.getByText("Marie Martin")).toBeInTheDocument()
    expect(screen.getByText("Code: M001")).toBeInTheDocument()
    expect(screen.getByText("Code: M002")).toBeInTheDocument()
  })

  it("handles member code input", () => {
    render(<AccountStatementPage />)
    
    const memberCodeInput = screen.getByTestId("memberCode")
    fireEvent.change(memberCodeInput, { target: { value: "M001" } })
    
    expect(memberCodeInput).toHaveValue("M001")
  })

  it("handles cumulative date input", () => {
    render(<AccountStatementPage />)
    
    const dateInput = screen.getByTestId("cumulativeDate")
    fireEvent.change(dateInput, { target: { value: "2024-12-31" } })
    
    expect(dateInput).toHaveValue("2024-12-31")
  })

  it("handles printer selection", () => {
    render(<AccountStatementPage />)
    
    const printer6Button = screen.getByText("Imprimante 6")
    fireEvent.click(printer6Button)
    
    expect(printer6Button).toHaveClass("border-blue-500", "bg-blue-50", "text-blue-700")
  })

  it("handles member selection from list", () => {
    mockStore.accountStatements = [
      {
        memberCode: "M001",
        memberName: "Jean Dupont",
        memberNumber: "12345",
        currency: "EUR",
        accountingPeriod: "2024",
        printMask: null,
        editionLabel: null
      }
    ]
    
    render(<AccountStatementPage />)
    
    const memberButtons = screen.getAllByText("Jean Dupont")
    const memberButton = memberButtons.find(button => button.tagName === 'P' && button.closest('button'))?.closest('button')
    
    if (memberButton) {
      fireEvent.click(memberButton)
    }
    
    const memberCodeInput = screen.getByTestId("memberCode")
    expect(memberCodeInput).toHaveValue("M001")
    
    expect(screen.getByText("Nom:")).toBeInTheDocument()
  })

  it("handles generate statement submission", async () => {
    mockStore.validatePrinter1.mockResolvedValue(true)
    mockStore.generateAccountStatement.mockResolvedValue({
      memberCode: "M001",
      memberName: "Jean Dupont",
      memberNumber: "12345",
      currency: "EUR",
      accountingPeriod: "2024",
      printMask: null,
      editionLabel: null
    })
    mockStore.printStatementByName.mockResolvedValue()
    mockStore.logPrintOperation.mockResolvedValue()
    
    render(<AccountStatementPage />)
    
    const memberCodeInput = screen.getByTestId("memberCode")
    fireEvent.change(memberCodeInput, { target: { value: "M001" } })
    
    const generateButton = screen.getByText("Générer l'Extrait")
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument()
      expect(screen.getByText("Veuillez patienter...")).toBeInTheDocument()
    })
    
    await waitFor(() => {
      expect(mockStore.validatePrinter1).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(mockStore.generateAccountStatement).toHaveBeenCalledWith("M001", 1)
    })
    
    await waitFor(() => {
      expect(mockStore.printStatementByName).toHaveBeenCalledWith("M001", 1)
    })
    
    await waitFor(() => {
      expect(mockStore.logPrintOperation).toHaveBeenCalledWith("M001", 1, "PRINT_STATEMENT")
    })
  })

  it("disables generate button when member code is empty", () => {
    render(<AccountStatementPage />)
    
    const generateButton = screen.getByText("Générer l'Extrait")
    expect(generateButton).toBeDisabled()
  })

  it("enables generate button when member code is provided", () => {
    render(<AccountStatementPage />)
    
    const memberCodeInput = screen.getByTestId("memberCode")
    fireEvent.change(memberCodeInput, { target: { value: "M001" } })
    
    const generateButton = screen.getByText("Générer l'Extrait")
    expect(generateButton).not.toBeDisabled()
  })

  it("handles dialog cancel", () => {
    render(<AccountStatementPage />)
    
    const memberCodeInput = screen.getByTestId("memberCode")
    fireEvent.change(memberCodeInput, { target: { value: "M001" } })
    
    const generateButton = screen.getByText("Générer l'Extrait")
    fireEvent.click(generateButton)
    
    const cancelButton = screen.getByText("Annuler")
    fireEvent.click(cancelButton)
    
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument()
  })

  it("calls validateDirectCall and reset on mount and unmount", () => {
    const { unmount } = render(<AccountStatementPage />)
    
    expect(mockStore.validateDirectCall).toHaveBeenCalled()
    
    unmount()
    expect(mockStore.reset).toHaveBeenCalled()
  })

  it("displays different printer validation for different printers", async () => {
    mockStore.validatePrinter8.mockResolvedValue(true)
    mockStore.generateAccountStatement.mockResolvedValue({
      memberCode: "M001",
      memberName: "Jean Dupont",
      memberNumber: "12345",
      currency: "EUR",
      accountingPeriod: "2024",
      printMask: null,
      editionLabel: null
    })
    mockStore.printStatementByName.mockResolvedValue()
    mockStore.logPrintOperation.mockResolvedValue()
    
    render(<AccountStatementPage />)
    
    const printer8Button = screen.getByText("Imprimante 8")
    fireEvent.click(printer8Button)
    
    await waitFor(() => {
      expect(mockStore.validatePrinter8).toHaveBeenCalled()
    })
    
    const memberCodeInput = screen.getByTestId("memberCode")
    fireEvent.change(memberCodeInput, { target: { value: "M001" } })
    
    const generateButton = screen.getByText("Générer l'Extrait")
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(mockStore.validatePrinter8).toHaveBeenCalledTimes(2)
    })
  })

  it("handles printer validation failure", async () => {
    mockStore.validatePrinter1.mockResolvedValue(false)
    
    render(<AccountStatementPage />)
    
    const memberCodeInput = screen.getByTestId("memberCode")
    fireEvent.change(memberCodeInput, { target: { value: "M001" } })
    
    const generateButton = screen.getByText("Générer l'Extrait")
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText("Une erreur est survenue")).toBeInTheDocument()
    })
  })
})